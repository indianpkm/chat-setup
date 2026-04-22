/**
 * JWT Utilities
 *
 * - Access tokens: short-lived (15m), stateless JWT
 * - Refresh tokens: long-lived (7d), opaque random bytes — only the SHA-256
 *   hash is stored in the database, never the raw token
 */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
/**
 * Generate a signed JWT access token.
 * Short-lived (default 15m) — clients should refresh proactively.
 */
export function generateAccessToken(userId, email) {
    return jwt.sign({ sub: userId, email }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}
/**
 * Generate a cryptographically secure opaque refresh token.
 * Returns both the raw token (sent to client once) and its hash (stored in DB).
 */
export function generateRefreshToken() {
    const raw = crypto.randomBytes(64).toString('hex');
    const hash = hashToken(raw);
    return { raw, hash };
}
/** Verify and decode an access token. Throws on expired/invalid. */
export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
/** SHA-256 hash a token — used for safe DB storage of refresh tokens */
export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
//# sourceMappingURL=jwt.js.map