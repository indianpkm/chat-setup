/**
 * Users Service
 *
 * User profile management and discovery.
 * The publicKey endpoint is critical for E2E encryption —
 * clients fetch it to derive the shared secret before sending a message.
 */

import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { isValidPublicKey } from '../../utils/crypto.js';

// Safe user select — never expose passwordHash
const safeUserSelect = {
  id: true,
  username: true,
  email: true,
  avatar: true,
  bio: true,
  status: true,
  lastSeen: true,
  createdAt: true,
} as const;

/** Search users by username or email (excludes the requesting user) */
export async function searchUsers(
  query: string,
  requesterId: string,
  limit = 20,
) {
  return prisma.user.findMany({
    where: {
      id: { not: requesterId },
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: safeUserSelect,
    take: Math.min(limit, 50),
    orderBy: { username: 'asc' },
  });
}

/** Get a user's public profile by ID */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

/**
 * Get a user's X25519 public key.
 * This is the only field clients need to initiate E2E encrypted communication.
 */
export async function getUserPublicKey(
  userId: string,
): Promise<{ id: string; publicKey: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, publicKey: true },
  });

  if (!user) throw new AppError('User not found', 404);
  if (!user.publicKey) throw new AppError('User has no public key registered', 404);

  return { id: user.id, publicKey: user.publicKey };
}

// Update profile schema
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  bio: z.string().max(160).optional(),
  avatar: z.string().url().optional(),
  publicKey: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Update the authenticated user's own profile */
export async function updateMyProfile(
  userId: string,
  input: UpdateProfileInput,
) {
  const { publicKey, ...rest } = input;

  // Validate new public key if provided
  if (publicKey !== undefined && !isValidPublicKey(publicKey)) {
    throw new AppError('Invalid public key format', 400);
  }

  // Check username uniqueness if changing
  if (rest.username) {
    const existing = await prisma.user.findFirst({
      where: { username: rest.username, id: { not: userId } },
    });
    if (existing) throw new AppError('Username already taken', 409);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { ...rest, ...(publicKey !== undefined && { publicKey }) },
    select: safeUserSelect,
  });
}
