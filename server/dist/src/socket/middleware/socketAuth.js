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
import { verifyAccessToken } from '../../utils/jwt.js';
import { logger } from '../../lib/logger.js';
export function socketAuthMiddleware(socket, next) {
    try {
        // Primary: handshake auth token (set in client: io({ auth: { token } }))
        const token = socket.handshake.auth?.token ??
            socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
        if (!token) {
            return next(new Error('Authentication required: no token provided'));
        }
        const payload = verifyAccessToken(token);
        socket.data.userId = payload.sub;
        socket.data.email = payload.email;
        logger.debug({ userId: payload.sub, socketId: socket.id }, 'Socket authenticated');
        next();
    }
    catch {
        next(new Error('Authentication failed: invalid or expired token'));
    }
}
//# sourceMappingURL=socketAuth.js.map