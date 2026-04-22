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
import type { TypedServer, TypedSocket } from '../../types/socket.js';
export declare function registerPresenceHandlers(io: TypedServer, socket: TypedSocket): void;
