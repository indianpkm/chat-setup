/**
 * Users Service
 *
 * User profile management and discovery.
 * The publicKey endpoint is critical for E2E encryption —
 * clients fetch it to derive the shared secret before sending a message.
 */
import { z } from 'zod';
/** Search users by username or email (excludes the requesting user) */
export declare function searchUsers(query: string, requesterId: string, limit?: number): Promise<{
    email: string;
    id: string;
    username: string;
    createdAt: Date;
    avatar: string | null;
    bio: string | null;
    status: import("../../../generated/prisma/enums.js").UserStatus;
    lastSeen: Date | null;
}[]>;
/** Get a user's public profile by ID */
export declare function getUserById(userId: string): Promise<{
    email: string;
    id: string;
    username: string;
    createdAt: Date;
    avatar: string | null;
    bio: string | null;
    status: import("../../../generated/prisma/enums.js").UserStatus;
    lastSeen: Date | null;
}>;
/**
 * Get a user's X25519 public key.
 * This is the only field clients need to initiate E2E encrypted communication.
 */
export declare function getUserPublicKey(userId: string): Promise<{
    id: string;
    publicKey: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    publicKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
/** Update the authenticated user's own profile */
export declare function updateMyProfile(userId: string, input: UpdateProfileInput): Promise<{
    email: string;
    id: string;
    username: string;
    createdAt: Date;
    avatar: string | null;
    bio: string | null;
    status: import("../../../generated/prisma/enums.js").UserStatus;
    lastSeen: Date | null;
}>;
