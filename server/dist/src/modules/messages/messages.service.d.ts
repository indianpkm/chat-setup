/**
 * Messages Service
 *
 * Handles message persistence and retrieval.
 * Uses cursor-based pagination for O(log n) performance even with millions of messages.
 *
 * Important: messages are NEVER decrypted here — the server only stores/retrieves
 * encrypted blobs. The `encryptedContent` and `nonce` fields are opaque to the server.
 */
import type { ContentType } from '../../../generated/prisma/client.js';
export interface SaveMessageInput {
    conversationId: string;
    senderId: string;
    encryptedContent: string;
    nonce: string;
    contentType: ContentType;
    mediaUrl?: string;
    replyToId?: string;
}
/**
 * Cursor-based message pagination.
 * `cursor` = ISO timestamp of the oldest message fetched so far.
 * Returns messages in ascending chronological order (oldest → newest).
 */
export declare function getMessages(conversationId: string, userId: string, cursor?: string, limit?: number): Promise<{
    messages: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        conversationId: string;
        senderId: string;
        encryptedContent: string;
        nonce: string;
        contentType: ContentType;
        mediaUrl: string | null;
        replyToId: string | null;
        isEdited: boolean;
        sender: {
            id: string;
            username: string;
            avatar: string | null;
        };
        reads: {
            userId: string;
            readAt: Date;
        }[];
        media: {
            url: string;
            id: string;
            createdAt: Date;
            messageId: string;
            mimeType: string;
            size: number;
            width: number | null;
            height: number | null;
            duration: number | null;
        }[];
    }[];
    hasMore: boolean;
    nextCursor: string | null;
}>;
/**
 * Persist an encrypted message.
 * Uses a transaction to atomically save the message and update `lastMessageAt`.
 */
export declare function saveMessage(input: SaveMessageInput): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    conversationId: string;
    senderId: string;
    encryptedContent: string;
    nonce: string;
    contentType: ContentType;
    mediaUrl: string | null;
    replyToId: string | null;
    isEdited: boolean;
    sender: {
        id: string;
        username: string;
        avatar: string | null;
    };
    reads: {
        userId: string;
        readAt: Date;
    }[];
    media: {
        url: string;
        id: string;
        createdAt: Date;
        messageId: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        duration: number | null;
    }[];
}>;
/** Upsert a read receipt — idempotent */
export declare function markMessageRead(messageId: string, userId: string): Promise<{
    userId: string;
    messageId: string;
    readAt: Date;
}>;
/**
 * Soft-delete a message — wipes content, keeps the record.
 * Only the sender can delete their own message.
 */
export declare function deleteMessage(messageId: string, userId: string): Promise<{
    id: string;
    conversationId: string;
    deletedAt: Date | null;
}>;
/**
 * Edit message — replace encrypted content with new ciphertext + nonce.
 * Only the sender can edit. Server does not validate the content change.
 */
export declare function editMessage(messageId: string, userId: string, encryptedContent: string, nonce: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    conversationId: string;
    senderId: string;
    encryptedContent: string;
    nonce: string;
    contentType: ContentType;
    mediaUrl: string | null;
    replyToId: string | null;
    isEdited: boolean;
    sender: {
        id: string;
        username: string;
        avatar: string | null;
    };
    reads: {
        userId: string;
        readAt: Date;
    }[];
    media: {
        url: string;
        id: string;
        createdAt: Date;
        messageId: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        duration: number | null;
    }[];
}>;
