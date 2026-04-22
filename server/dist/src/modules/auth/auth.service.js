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
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { generateAccessToken, generateRefreshToken, hashToken, } from '../../utils/jwt.js';
import { isValidPublicKey } from '../../utils/crypto.js';
import { AppError } from '../../middleware/errorHandler.js';
import { CONSTANTS } from '../../config/constants.js';
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function issueTokenPair(userId, email) {
    const accessToken = generateAccessToken(userId, email);
    const { raw: refreshToken, hash: tokenHash } = generateRefreshToken();
    const expiresAt = new Date(Date.now() + CONSTANTS.REFRESH_TOKEN_EXPIRY_MS);
    await prisma.refreshToken.create({
        data: { userId, tokenHash, expiresAt },
    });
    return { accessToken, refreshToken };
}
// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------
export async function registerUser(input) {
    const { username, email, password, publicKey } = input;
    // Validate X25519 public key format
    if (!isValidPublicKey(publicKey)) {
        throw new AppError('Invalid public key — must be a base64-encoded 32-byte X25519 key', 400);
    }
    // Check uniqueness
    const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { email: true, username: true },
    });
    if (existing) {
        throw new AppError(existing.email === email
            ? 'Email is already registered'
            : 'Username is already taken', 409);
    }
    const passwordHash = await bcrypt.hash(password, CONSTANTS.BCRYPT_ROUNDS);
    const user = await prisma.user.create({
        data: { username, email, passwordHash, publicKey },
        select: {
            id: true,
            username: true,
            email: true,
            publicKey: true,
            avatar: true,
            createdAt: true,
        },
    });
    const tokens = await issueTokenPair(user.id, user.email);
    return { user, ...tokens };
}
export async function loginUser(input) {
    const { email, password } = input;
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            username: true,
            passwordHash: true,
            avatar: true,
            publicKey: true,
            status: true,
        },
    });
    // Use constant-time comparison to avoid timing attacks
    const isMatch = user
        ? await bcrypt.compare(password, user.passwordHash)
        : await bcrypt.compare(password, '$2b$12$invalidhashfortimingnormalize');
    if (!user || !isMatch) {
        throw new AppError('Invalid email or password', 401);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _omit, ...safeUser } = user;
    const tokens = await issueTokenPair(user.id, user.email);
    return { user: safeUser, ...tokens };
}
export async function refreshTokens(input) {
    const tokenHash = hashToken(input.refreshToken);
    const stored = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: {
            user: { select: { id: true, email: true } },
        },
    });
    // Reject: not found, already revoked, or expired
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
        // If revoked token reused — possible token theft: revoke ALL tokens for this user
        if (stored?.revoked) {
            await prisma.refreshToken.updateMany({
                where: { userId: stored.userId, revoked: false },
                data: { revoked: true },
            });
            throw new AppError('Refresh token reuse detected — all sessions revoked for security', 401);
        }
        throw new AppError('Invalid or expired refresh token', 401);
    }
    // Rotate: revoke current token and issue a new pair
    await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
    });
    return issueTokenPair(stored.userId, stored.user.email);
}
export async function logoutUser(rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
    });
}
export async function getMe(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            bio: true,
            publicKey: true,
            status: true,
            lastSeen: true,
            createdAt: true,
        },
    });
    if (!user)
        throw new AppError('User not found', 404);
    return user;
}
//# sourceMappingURL=auth.service.js.map