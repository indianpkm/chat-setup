/**
 * Messages Service
 *
 * Handles message persistence and retrieval.
 * Uses cursor-based pagination for O(log n) performance even with millions of messages.
 *
 * Important: messages are NEVER decrypted here — the server only stores/retrieves
 * encrypted blobs. The `encryptedContent` and `nonce` fields are opaque to the server.
 */

import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { ContentType } from '../../../generated/prisma/client.js';
import { CONSTANTS } from '../../config/constants.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SaveMessageInput {
  conversationId: string;
  senderId: string;
  encryptedContent: string;
  nonce: string;
  contentType: ContentType;
  mediaUrl?: string;
  replyToId?: string;
}

// ---------------------------------------------------------------------------
// Shared selects
// ---------------------------------------------------------------------------

const messageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  encryptedContent: true,
  nonce: true,
  contentType: true,
  mediaUrl: true,
  replyToId: true,
  isEdited: true,
  createdAt: true,
  updatedAt: true,
  sender: {
    select: { id: true, username: true, avatar: true },
  },
  reads: {
    select: { userId: true, readAt: true },
  },
  media: true,
} as const;

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Cursor-based message pagination.
 * `cursor` = ISO timestamp of the oldest message fetched so far.
 * Returns messages in ascending chronological order (oldest → newest).
 */
export async function getMessages(
  conversationId: string,
  userId: string,
  cursor?: string,
  limit: number = CONSTANTS.PAGINATION.DEFAULT_LIMIT,
) {
  // Membership check
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!membership || membership.leftAt) {
    throw new AppError('Access denied', 403);
  }

  const safeLimit = Math.min(limit, CONSTANTS.PAGINATION.MAX_LIMIT);

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,
      ...(cursor
        ? { createdAt: { lt: new Date(cursor) } }
        : {}),
    },
    orderBy: { createdAt: 'desc' }, // newest first for efficient pagination
    take: safeLimit + 1, // fetch one extra to determine hasMore
    select: messageSelect,
  });

  const hasMore = messages.length > safeLimit;
  if (hasMore) messages.pop(); // remove the extra

  // Return in chronological order (oldest → newest) for chat display
  const ordered = messages.reverse();

  return {
    messages: ordered,
    hasMore,
    nextCursor: hasMore && ordered[0]
      ? ordered[0].createdAt.toISOString()
      : null,
  };
}

/**
 * Persist an encrypted message.
 * Uses a transaction to atomically save the message and update `lastMessageAt`.
 */
export async function saveMessage(input: SaveMessageInput) {
  // Membership check
  const membership = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: input.conversationId,
        userId: input.senderId,
      },
    },
  });
  if (!membership || membership.leftAt) {
    throw new AppError('You are not a member of this conversation', 403);
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: input.conversationId,
        senderId: input.senderId,
        encryptedContent: input.encryptedContent,
        nonce: input.nonce,
        contentType: input.contentType,
        mediaUrl: input.mediaUrl,
        replyToId: input.replyToId,
      },
      select: messageSelect,
    }),
    prisma.conversation.update({
      where: { id: input.conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return message;
}

/** Upsert a read receipt — idempotent */
export async function markMessageRead(messageId: string, userId: string) {
  return prisma.messageRead.upsert({
    where: { messageId_userId: { messageId, userId } },
    create: { messageId, userId },
    update: { readAt: new Date() },
  });
}

/**
 * Soft-delete a message — wipes content, keeps the record.
 * Only the sender can delete their own message.
 */
export async function deleteMessage(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, senderId: true, conversationId: true },
  });

  if (!message) throw new AppError('Message not found', 404);
  if (message.senderId !== userId) {
    throw new AppError('You can only delete your own messages', 403);
  }

  return prisma.message.update({
    where: { id: messageId },
    data: {
      deletedAt: new Date(),
      encryptedContent: '', // Wipe ciphertext
      nonce: '',
      mediaUrl: null,
    },
    select: { id: true, conversationId: true, deletedAt: true },
  });
}

/**
 * Edit message — replace encrypted content with new ciphertext + nonce.
 * Only the sender can edit. Server does not validate the content change.
 */
export async function editMessage(
  messageId: string,
  userId: string,
  encryptedContent: string,
  nonce: string,
) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, senderId: true, conversationId: true, deletedAt: true },
  });

  if (!message) throw new AppError('Message not found', 404);
  if (message.senderId !== userId) {
    throw new AppError('You can only edit your own messages', 403);
  }
  if (message.deletedAt) {
    throw new AppError('Cannot edit a deleted message', 400);
  }

  return prisma.message.update({
    where: { id: messageId },
    data: { encryptedContent, nonce, isEdited: true },
    select: messageSelect,
  });
}
