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

import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import { CONSTANTS } from "../../config/constants.js";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const createDMSchema = z.object({
  recipientId: z.uuid("Invalid recipient ID"),
});

export const createGroupSchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(256).optional(),
  avatar: z.url().optional(),
  participantIds: z
    .array(z.string().uuid())
    .min(1, "At least one other participant is required")
    .max(CONSTANTS.MAX_GROUP_MEMBERS - 1),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  description: z.string().max(256).optional(),
  avatar: z.url().optional(),
});

export const addParticipantsSchema = z.object({
  userIds: z.array(z.uuid()).min(1).max(50),
});

export type CreateDMInput = z.infer<typeof createDMSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

// ---------------------------------------------------------------------------
// Shared select objects
// ---------------------------------------------------------------------------

const participantSelect = {
  userId: true,
  role: true,
  mutedUntil: true,
  joinedAt: true,
  user: {
    select: {
      id: true,
      username: true,
      avatar: true,
      status: true,
      lastSeen: true,
      publicKey: true, // Needed for group key distribution
    },
  },
} as const;

const lastMessageSelect = {
  id: true,
  encryptedContent: true,
  nonce: true,
  contentType: true,
  createdAt: true,
  senderId: true,
} as const;

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/** Get all conversations for a user, ordered by most recent activity */
export async function getUserConversations(userId: string) {
  return prisma.conversation.findMany({
    where: {
      participants: { some: { userId, leftAt: null } },
    },
    include: {
      participants: {
        where: { leftAt: null },
        select: participantSelect,
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: lastMessageSelect,
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });
}

/** Get or create a DIRECT conversation between two users (idempotent) */
export async function getOrCreateDM(userId: string, recipientId: string) {
  if (userId === recipientId) {
    throw new AppError("Cannot create a conversation with yourself", 400);
  }

  // Check recipient exists
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true },
  });

  if (!recipient) throw new AppError("Recipient user not found", 404);

  // Check for existing DM (both must be active participants)
  const existing = await prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      participants: {
        every: {
          userId: { in: [userId, recipientId] },
          leftAt: null,
        },
      },
    },
    include: {
      participants: {
        where: { leftAt: null },
        select: participantSelect,
      },
    },
  });

  if (existing) return { conversation: existing, created: false };

  const conversation = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      participants: {
        create: [
          { userId, role: "OWNER" },
          { userId: recipientId, role: "MEMBER" },
        ],
      },
    },
    include: {
      participants: {
        where: { leftAt: null },
        select: participantSelect,
      },
    },
  });

  return { conversation, created: true };
}

/** Create a GROUP conversation */
export async function createGroup(creatorId: string, input: CreateGroupInput) {
  const { name, description, avatar, participantIds } = input;

  const uniqueIds = [...new Set([creatorId, ...participantIds])];

  if (uniqueIds.length > CONSTANTS.MAX_GROUP_MEMBERS) {
    throw new AppError(
      `Group cannot exceed ${CONSTANTS.MAX_GROUP_MEMBERS} members`,
      400,
    );
  }

  // Verify all participant IDs exist
  const users = await prisma.user.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
  });

  if (users.length !== uniqueIds.length) {
    throw new AppError("One or more participant IDs are invalid", 400);
  }

  return prisma.conversation.create({
    data: {
      type: "GROUP",
      name,
      description,
      avatar,
      participants: {
        create: uniqueIds.map((id) => ({
          userId: id,
          role: id === creatorId ? "OWNER" : "MEMBER",
        })),
      },
    },
    include: {
      participants: {
        where: { leftAt: null },
        select: participantSelect,
      },
    },
  });
}

/** Get a conversation by ID — also verifies caller is an active member */
export async function getConversationById(
  conversationId: string,
  userId: string,
) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: { some: { userId, leftAt: null } },
    },
    include: {
      participants: {
        where: { leftAt: null },
        select: participantSelect,
      },
    },
  });

  if (!conversation) throw new AppError("Conversation not found", 404);
  return conversation;
}

/** Update group name/avatar/description — only ADMIN or OWNER */
export async function updateGroup(
  conversationId: string,
  userId: string,
  input: UpdateGroupInput,
) {
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    include: { conversation: { select: { type: true } } },
  });

  if (!membership || membership.leftAt) {
    throw new AppError("Conversation not found", 404);
  }
  if (membership.conversation.type !== "GROUP") {
    throw new AppError("Cannot update a direct conversation", 400);
  }
  if (membership.role === "MEMBER") {
    throw new AppError("Only admins can update group details", 403);
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data: input,
    include: {
      participants: {
        where: { leftAt: null },
        select: participantSelect,
      },
    },
  });
}

/** Add participants to a group — only ADMIN or OWNER */
export async function addParticipants(
  conversationId: string,
  requesterId: string,
  userIds: string[],
) {
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: requesterId } },
  });

  if (!membership || membership.leftAt || membership.role === "MEMBER") {
    throw new AppError("Only admins can add participants", 403);
  }

  // Upsert — re-adds previously removed participants
  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId, userId } },
        create: { conversationId, userId, role: "MEMBER" },
        update: { leftAt: null },
      }),
    ),
  );
}

/** Remove a participant from a group — ADMIN can remove MEMBER, OWNER can remove anyone */
export async function removeParticipant(
  conversationId: string,
  requesterId: string,
  targetUserId: string,
) {
  const [requester, target] = await Promise.all([
    prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: requesterId } },
    }),
    prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: targetUserId },
      },
    }),
  ]);

  if (!requester || requester.leftAt) throw new AppError("Access denied", 403);
  if (!target || target.leftAt)
    throw new AppError("Participant not found", 404);

  if (requester.role === "MEMBER")
    throw new AppError("Only admins can remove participants", 403);
  if (requester.role === "ADMIN" && target.role !== "MEMBER") {
    throw new AppError("Admins can only remove members", 403);
  }

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: targetUserId } },
    data: { leftAt: new Date() },
  });
}

/** Leave a group conversation */
export async function leaveConversation(
  conversationId: string,
  userId: string,
) {
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    include: { conversation: { select: { type: true } } },
  });

  if (!membership || membership.leftAt) throw new AppError("Not a member", 404);
  if (membership.conversation.type === "DIRECT") {
    throw new AppError("Cannot leave a direct conversation", 400);
  }

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { leftAt: new Date() },
  });
}
