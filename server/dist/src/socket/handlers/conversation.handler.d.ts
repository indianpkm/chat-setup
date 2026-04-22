/**
 * Conversation Room Handler
 *
 * Joins the authenticated socket to all of the user's active conversation rooms
 * immediately after connection. This ensures they receive real-time events
 * (new messages, typing indicators, etc.) for all their conversations.
 *
 * Room naming:  conv:{conversationId}
 * User room:    user:{userId}  — for direct (call incoming, etc.)
 */
import type { TypedServer, TypedSocket } from '../../types/socket.js';
export declare function registerConversationHandlers(_io: TypedServer, socket: TypedSocket): void;
/**
 * Utility: emit to all members of a conversation (across all server instances).
 * Use this from other handlers to broadcast conversation events.
 */
export declare function emitToConversation(io: TypedServer, conversationId: string, event: string, ...args: any[]): void;
