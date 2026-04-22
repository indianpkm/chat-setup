/**
 * Socket.IO Server Initialization
 *
 * Sets up the Socket.IO server with:
 *   - Redis adapter (enables horizontal scaling across multiple Node instances)
 *   - JWT authentication middleware
 *   - All event handlers registered per connection
 *   - Structured logging for connect/disconnect events
 *
 * Must be called AFTER connectRedis() succeeds.
 */
import type { Server as HTTPServer } from 'http';
import type { TypedServer } from '../types/socket.js';
export declare function initSocketServer(httpServer: HTTPServer): TypedServer;
/** Get the initialized Socket.IO server instance */
export declare function getIO(): TypedServer;
