/**
 * Message Socket Handler
 *
 * Handles real-time message events:
 *   msg:send    — persist + broadcast encrypted message
 *   msg:read    — persist read receipt + broadcast to conversation
 *   msg:delete  — soft-delete + broadcast deletion
 *
 * Rate limiting: 30 messages/second per user (Redis-backed, distributed).
 */

import {
  saveMessage,
  markMessageRead,
  deleteMessage,
} from '../../modules/messages/messages.service.js';
import { getConversationById } from '../../modules/conversations/conversations.service.js';
import { notificationQueue } from '../../jobs/queues.js';
import { checkSocketMessageLimit } from '../../middleware/rateLimiter.js';
import { logger } from '../../lib/logger.js';
import type { TypedServer, TypedSocket, SendMessagePayload } from '../../types/socket.js';
import type { ContentType } from "@prisma/client";

export function registerMessageHandlers(
  io: TypedServer,
  socket: TypedSocket,
): void {
  const userId = socket.data.userId;

  // -------------------------------------------------------------------------
  // msg:send
  // -------------------------------------------------------------------------
  socket.on('msg:send', async (payload: SendMessagePayload, ack) => {
    try {
      // Per-user rate limit check (Redis-backed, works across instances)
      const allowed = await checkSocketMessageLimit(userId);
      if (!allowed) {
        ack({ success: false, error: 'Message rate limit exceeded' });
        return;
      }

      const message = await saveMessage({
        conversationId: payload.conversationId,
        senderId: userId,
        encryptedContent: payload.encryptedContent,
        nonce: payload.nonce,
        contentType: payload.contentType as ContentType,
        mediaUrl: payload.mediaUrl,
        replyToId: payload.replyToId,
      });

      // Broadcast to all members of the conversation room (all instances)
      io.to(`conversation:${payload.conversationId}`).emit('msg:new', {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        encryptedContent: message.encryptedContent,
        nonce: message.nonce,
        contentType: message.contentType,
        mediaUrl: message.mediaUrl,
        replyToId: message.replyToId,
        isEdited: message.isEdited,
        createdAt: message.createdAt,
        sender: message.sender,
      });

      // Queue push notifications for offline members
      const conversation = await getConversationById(
        payload.conversationId,
        userId,
      );
      const recipientIds = conversation.participants
        .filter((p) => p.userId !== userId)
        .map((p) => p.userId);

      if (recipientIds.length > 0) {
        await notificationQueue.add(
          'new-message',
          {
            messageId: message.id,
            conversationId: payload.conversationId,
            senderId: userId,
            recipientIds,
          },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: 50,
          },
        );
      }

      ack({ success: true, data: { messageId: message.id } });
    } catch (err) {
      logger.error({ err, userId, conversationId: payload.conversationId }, 'msg:send error');
      ack({ success: false, error: 'Failed to send message' });
    }
  });

  // -------------------------------------------------------------------------
  // msg:read
  // -------------------------------------------------------------------------
  socket.on('msg:read', async ({ messageId, conversationId }) => {
    try {
      const read = await markMessageRead(messageId, userId);
      // Notify all conversation members about the read receipt
      io.to(`conversation:${conversationId}`).emit('msg:read-receipt', {
        messageId,
        userId,
        readAt: read.readAt,
      });
    } catch (err) {
      logger.error({ err, userId, messageId }, 'msg:read error');
    }
  });

  // -------------------------------------------------------------------------
  // msg:delete
  // -------------------------------------------------------------------------
  socket.on('msg:delete', async ({ messageId }) => {
    try {
      const result = await deleteMessage(messageId, userId);
      io.to(`conversation:${result.conversationId}`).emit('msg:deleted', {
        messageId,
        conversationId: result.conversationId,
      });
    } catch (err) {
      logger.error({ err, userId, messageId }, 'msg:delete error');
    }
  });
}
