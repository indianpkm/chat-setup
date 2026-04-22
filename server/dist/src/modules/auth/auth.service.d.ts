/**
 * Auth Service
 *
 * All business logic for authentication:
 *   - register:       Hash password, validate publicKey, create user, issue tokens
 *   - login:          Validate credentials, issue tokens
 *   - refreshTokens:  Verify + rotate refresh token, issue new pair
 *   - logout:         Revoke refresh token
 *
 * Security notes:
 *   - bcrypt cost = 12 (~250ms hash time — effectively blocks brute force)
 *   - Refresh tokens are opaque random bytes; only SHA-256 hash stored in DB
 *   - Token rotation on every refresh — old token immediately revoked
 *   - Refresh tokens expire both by DB `expiresAt` AND Redis TTL (double check)
 */
import type { RegisterInput, LoginInput, RefreshTokenInput } from './auth.schema.js';
export declare function registerUser(input: RegisterInput): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        email: string;
        id: string;
        username: string;
        publicKey: string | null;
        createdAt: Date;
        avatar: string | null;
    };
}>;
export declare function loginUser(input: LoginInput): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        email: string;
        id: string;
        username: string;
        publicKey: string | null;
        avatar: string | null;
        status: import("../../../generated/prisma/enums.js").UserStatus;
    };
}>;
export declare function refreshTokens(input: RefreshTokenInput): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare function logoutUser(rawRefreshToken: string): Promise<void>;
export declare function getMe(userId: string): Promise<{
    email: string;
    id: string;
    username: string;
    publicKey: string | null;
    createdAt: Date;
    avatar: string | null;
    bio: string | null;
    status: import("../../../generated/prisma/enums.js").UserStatus;
    lastSeen: Date | null;
}>;
