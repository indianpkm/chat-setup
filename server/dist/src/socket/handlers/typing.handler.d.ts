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
import type { TypedServer, TypedSocket } from '../../types/socket.js';
export declare function registerTypingHandlers(io: TypedServer, socket: TypedSocket): void;
