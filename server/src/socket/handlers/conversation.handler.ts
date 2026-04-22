/**
 * Conversation Room Handler
 *
 * Joins the authenticated socket to all of the user's active conversation rooms
 * immediately after connection. This ensures they receive real-time events
 * (new messages, typing indicators, etc.) for all their conversations.
 *
 * Room naming:  conv:{conversationId}
 * User room:    user:{userId}  — for direct (call incoming, etc.)
 */

import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';
import type { TypedServer, TypedSocket } from '../../types/socket.js';

export function registerConversationHandlers(
  _io: TypedServer,
  socket: TypedSocket,
): void {
  const userId = socket.data.userId;

  // Join all active conversation rooms on connect
  void joinUserConversationRooms(socket, userId);
}

async function joinUserConversationRooms(
  socket: TypedSocket,
  userId: string,
): Promise<void> {
  try {
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId, leftAt: null },
      select: { conversationId: true },
    });

    const rooms = participants.map((p) => `conv:${p.conversationId}`);

    if (rooms.length > 0) {
      socket.join(rooms);
      logger.debug(
        { userId, roomCount: rooms.length },
        'Socket joined conversation rooms',
      );
    }
  } catch (err) {
    logger.error({ err, userId }, 'Failed to join conversation rooms');
  }
}

/**
 * Utility: emit to all members of a conversation (across all server instances).
 * Use this from other handlers to broadcast conversation events.
 */
export function emitToConversation(
  io: TypedServer,
  conversationId: string,
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (io.to(`conv:${conversationId}`) as any).emit(event, ...args);
}
