/**
 * WebRTC Call Signaling Handler
 *
 * The server acts as a pure signaling relay — it never processes media streams.
 * All media is sent peer-to-peer via WebRTC after signaling completes.
 *
 * Signaling flow:
 *   1. Caller emits call:initiate → server creates DB record, notifies callee(s)
 *   2. Callee emits call:answer or call:reject
 *   3. Both peers exchange call:offer, call:answer, call:ice-candidate via server relay
 *   4. Either peer emits call:end to terminate
 *
 * Group calls: each new participant goes through the same offer/answer with existing peers.
 * Rooms: call:{callId} — all call participants join this room for ICE relay.
 */
import type { TypedServer, TypedSocket } from '../../types/socket.js';
export declare function registerCallHandlers(io: TypedServer, socket: TypedSocket): void;
