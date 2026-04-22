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
export declare function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void;
