/**
 * Presence Handler
 *
 * Tracks user online/offline status using Redis TTL keys.
 * Redis key: user:online:{userId}  →  TTL = PRESENCE_TTL_SECONDS (70s)
 *
 * Flow:
 *   1. On connect: set Redis key, update DB status=ONLINE, notify contacts
 *   2. On presence:ping: refresh TTL (client sends every 30s)
 *   3. On disconnect: delete Redis key, update DB status=OFFLINE, notify contacts
 *
 * Why Redis TTL?
 *   If the server crashes, the TTL expires automatically — no stuck "ONLINE" states.
 */

import { prisma } from '../../lib/prisma.js';
import { getRedisClient } from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';
import { CONSTANTS } from '../../config/constants.js';
import type { TypedServer, TypedSocket } from '../../types/socket.js';

export function registerPresenceHandlers(
  io: TypedServer,
  socket: TypedSocket,
): void {
  const userId = socket.data.userId;
  const redis = getRedisClient();

  async function setOnline(): Promise<void> {
    try {
      await redis.setex(
        `user:online:${userId}`,
        CONSTANTS.PRESENCE_TTL_SECONDS,
        '1',
      );
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'ONLINE', lastSeen: new Date() },
      });
      // Notify all connected sockets (cross-instance via Redis adapter)
      io.emit('presence:update', { userId, status: 'ONLINE', lastSeen: null });
    } catch (err) {
      logger.error({ err, userId }, 'Failed to set user online');
    }
  }

  async function setOffline(): Promise<void> {
    try {
      await redis.del(`user:online:${userId}`);
      const now = new Date();
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'OFFLINE', lastSeen: now },
      });
      io.emit('presence:update', { userId, status: 'OFFLINE', lastSeen: now });
    } catch (err) {
      logger.error({ err, userId }, 'Failed to set user offline');
    }
  }

  // Mark online immediately on connect
  void setOnline();

  // Heartbeat: refresh the Redis TTL so presence doesn't expire while connected
  socket.on('presence:ping', () => {
    redis
      .setex(`user:online:${userId}`, CONSTANTS.PRESENCE_TTL_SECONDS, '1')
      .catch((err: Error) => logger.error({ err }, 'Presence ping Redis error'));
  });

  // Mark offline when socket closes (handles both clean close and network drops)
  socket.on('disconnect', () => {
    // Delay slightly — user may reconnect immediately (page refresh)
    setTimeout(() => {
      // Only mark offline if no other socket for this user is active
      io.in(`user:${userId}`).fetchSockets().then((sockets) => {
        if (sockets.length === 0) {
          void setOffline();
        }
      }).catch(() => void setOffline());
    }, 5000);
  });
}
