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
import type { TypedServer, TypedSocket } from '../../types/socket.js';
export declare function registerMessageHandlers(io: TypedServer, socket: TypedSocket): void;
