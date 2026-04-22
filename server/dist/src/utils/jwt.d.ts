/**
 * JWT Utilities
 *
 * - Access tokens: short-lived (15m), stateless JWT
 * - Refresh tokens: long-lived (7d), opaque random bytes — only the SHA-256
 *   hash is stored in the database, never the raw token
 */
export interface AccessTokenPayload {
    /** Subject — the user's UUID */
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}
/**
 * Generate a signed JWT access token.
 * Short-lived (default 15m) — clients should refresh proactively.
 */
export declare function generateAccessToken(userId: string, email: string): string;
/**
 * Generate a cryptographically secure opaque refresh token.
 * Returns both the raw token (sent to client once) and its hash (stored in DB).
 */
export declare function generateRefreshToken(): {
    raw: string;
    hash: string;
};
/** Verify and decode an access token. Throws on expired/invalid. */
export declare function verifyAccessToken(token: string): AccessTokenPayload;
/** SHA-256 hash a token — used for safe DB storage of refresh tokens */
export declare function hashToken(token: string): string;
