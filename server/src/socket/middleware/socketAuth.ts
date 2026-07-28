/**
 * Socket.IO Authentication Middleware
 *
 * Runs before any socket connection is accepted.
 * Extracts the JWT from either:
 *   - socket.handshake.auth.token    (preferred — set in socket.io-client options)
 *   - Authorization header Bearer    (fallback)
 *
 * On success: populates socket.data.userId and socket.data.email
 * On failure: rejects the connection with an Error (shows as connection_error on client)
 */

import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt.js';
import { logger } from '../../lib/logger.js';

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> {
  try {
    // Primary: handshake auth token (set in client: io({ auth: { token } }))
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return next(new Error('Authentication required: no token provided'));
    }

    const payload = verifyAccessToken(token);

    // Strict validation: Check if user still exists in DB
    const { prisma } = await import('../../lib/prisma.js');
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    if (!user) {
      return next(new Error('Authentication failed: user no longer exists'));
    }

    socket.data.userId = user.id;
    socket.data.email = user.email;

    logger.debug(
      { userId: payload.sub, socketId: socket.id },
      'Socket authenticated',
    );
    next();
  } catch {
    next(new Error('Authentication failed: invalid or expired token'));
  }
}
