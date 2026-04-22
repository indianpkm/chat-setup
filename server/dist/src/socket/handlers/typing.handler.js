/**
 * Typing Indicator Handler
 *
 * Uses Redis TTL to auto-expire typing indicators.
 * If a client disconnects mid-typing, the indicator disappears after TYPING_TTL_SECONDS.
 *
 * Redis key: conv:typing:{conversationId}:{userId}  →  TTL = 5s
 *
 * The client should emit typing:start periodically while typing (every 2-3s)
 * and typing:stop on key-up pause or send.
 */
import { getRedisClient } from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';
import { CONSTANTS } from '../../config/constants.js';
export function registerTypingHandlers(io, socket) {
    const userId = socket.data.userId;
    const redis = getRedisClient();
    socket.on('typing:start', async ({ conversationId }) => {
        try {
            const key = `conv:typing:${conversationId}:${userId}`;
            await redis.setex(key, CONSTANTS.TYPING_TTL_SECONDS, '1');
            // Broadcast to all OTHER members in the conversation room
            socket.to(`conv:${conversationId}`).emit('typing:update', {
                conversationId,
                userId,
                isTyping: true,
            });
        }
        catch (err) {
            logger.error({ err, userId }, 'typing:start error');
        }
    });
    socket.on('typing:stop', async ({ conversationId }) => {
        try {
            const key = `conv:typing:${conversationId}:${userId}`;
            await redis.del(key);
            socket.to(`conv:${conversationId}`).emit('typing:update', {
                conversationId,
                userId,
                isTyping: false,
            });
        }
        catch (err) {
            logger.error({ err, userId }, 'typing:stop error');
        }
    });
    // Auto-stop typing on disconnect (cleanup)
    socket.on('disconnect', async () => {
        // Find all active typing keys for this user and clean them up
        try {
            const keys = await redis.keys(`conv:typing:*:${userId}`);
            if (keys.length > 0) {
                await redis.del(...keys);
                // Notify conversations this user was typing in
                for (const key of keys) {
                    const parts = key.split(':');
                    const conversationId = parts[2];
                    if (conversationId) {
                        io.to(`conv:${conversationId}`).emit('typing:update', {
                            conversationId,
                            userId,
                            isTyping: false,
                        });
                    }
                }
            }
        }
        catch (err) {
            logger.error({ err, userId }, 'typing cleanup on disconnect error');
        }
    });
}
//# sourceMappingURL=typing.handler.js.map