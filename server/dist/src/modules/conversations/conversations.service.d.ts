/**
 * Conversations Service
 *
 * Handles creation and management of both DIRECT (1:1) and GROUP conversations.
 *
 * Key behaviors:
 *   - DIRECT: idempotent — calling twice returns the existing conversation
 *   - GROUP:  owner always added as OWNER role
 *   - Participants are returned with publicKeys for group E2E key distribution
 *   - leftAt-based membership — participants who left are filtered out
 */
import { z } from 'zod';
export declare const createDMSchema: z.ZodObject<{
    recipientId: z.ZodString;
}, z.core.$strip>;
export declare const createGroupSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    participantIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const updateGroupSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const addParticipantsSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type CreateDMInput = z.infer<typeof createDMSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
/** Get all conversations for a user, ordered by most recent activity */
export declare function getUserConversations(userId: string): Promise<({
    participants: {
        user: {
            id: string;
            username: string;
            publicKey: string | null;
            avatar: string | null;
            status: import("../../../generated/prisma/enums.js").UserStatus;
            lastSeen: Date | null;
        };
        userId: string;
        role: import("../../../generated/prisma/enums.js").ParticipantRole;
        mutedUntil: Date | null;
        joinedAt: Date;
    }[];
    messages: {
        id: string;
        createdAt: Date;
        senderId: string;
        encryptedContent: string;
        nonce: string;
        contentType: import("../../../generated/prisma/enums.js").ContentType;
    }[];
} & {
    type: import("../../../generated/prisma/enums.js").ConversationType;
    name: string | null;
    id: string;
    createdAt: Date;
    avatar: string | null;
    updatedAt: Date;
    description: string | null;
    lastMessageAt: Date | null;
})[]>;
/** Get or create a DIRECT conversation between two users (idempotent) */
export declare function getOrCreateDM(userId: string, recipientId: string): Promise<{
    conversation: {
        participants: {
            user: {
                id: string;
                username: string;
                publicKey: string | null;
                avatar: string | null;
                status: import("../../../generated/prisma/enums.js").UserStatus;
                lastSeen: Date | null;
            };
            userId: string;
            role: import("../../../generated/prisma/enums.js").ParticipantRole;
            mutedUntil: Date | null;
            joinedAt: Date;
        }[];
    } & {
        type: import("../../../generated/prisma/enums.js").ConversationType;
        name: string | null;
        id: string;
        createdAt: Date;
        avatar: string | null;
        updatedAt: Date;
        description: string | null;
        lastMessageAt: Date | null;
    };
    created: boolean;
}>;
/** Create a GROUP conversation */
export declare function createGroup(creatorId: string, input: CreateGroupInput): Promise<{
    participants: {
        user: {
            id: string;
            username: string;
            publicKey: string | null;
            avatar: string | null;
            status: import("../../../generated/prisma/enums.js").UserStatus;
            lastSeen: Date | null;
        };
        userId: string;
        role: import("../../../generated/prisma/enums.js").ParticipantRole;
        mutedUntil: Date | null;
        joinedAt: Date;
    }[];
} & {
    type: import("../../../generated/prisma/enums.js").ConversationType;
    name: string | null;
    id: string;
    createdAt: Date;
    avatar: string | null;
    updatedAt: Date;
    description: string | null;
    lastMessageAt: Date | null;
}>;
/** Get a conversation by ID — also verifies caller is an active member */
export declare function getConversationById(conversationId: string, userId: string): Promise<{
    participants: {
        user: {
            id: string;
            username: string;
            publicKey: string | null;
            avatar: string | null;
            status: import("../../../generated/prisma/enums.js").UserStatus;
            lastSeen: Date | null;
        };
        userId: string;
        role: import("../../../generated/prisma/enums.js").ParticipantRole;
        mutedUntil: Date | null;
        joinedAt: Date;
    }[];
} & {
    type: import("../../../generated/prisma/enums.js").ConversationType;
    name: string | null;
    id: string;
    createdAt: Date;
    avatar: string | null;
    updatedAt: Date;
    description: string | null;
    lastMessageAt: Date | null;
}>;
/** Update group name/avatar/description — only ADMIN or OWNER */
export declare function updateGroup(conversationId: string, userId: string, input: UpdateGroupInput): Promise<{
    participants: {
        user: {
            id: string;
            username: string;
            publicKey: string | null;
            avatar: string | null;
            status: import("../../../generated/prisma/enums.js").UserStatus;
            lastSeen: Date | null;
        };
        userId: string;
        role: import("../../../generated/prisma/enums.js").ParticipantRole;
        mutedUntil: Date | null;
        joinedAt: Date;
    }[];
} & {
    type: import("../../../generated/prisma/enums.js").ConversationType;
    name: string | null;
    id: string;
    createdAt: Date;
    avatar: string | null;
    updatedAt: Date;
    description: string | null;
    lastMessageAt: Date | null;
}>;
/** Add participants to a group — only ADMIN or OWNER */
export declare function addParticipants(conversationId: string, requesterId: string, userIds: string[]): Promise<void>;
/** Remove a participant from a group — ADMIN can remove MEMBER, OWNER can remove anyone */
export declare function removeParticipant(conversationId: string, requesterId: string, targetUserId: string): Promise<void>;
/** Leave a group conversation */
export declare function leaveConversation(conversationId: string, userId: string): Promise<void>;
