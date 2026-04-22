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
export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email } as Omit<AccessTokenPayload, 'iat' | 'exp'>,
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
}

/**
 * Generate a cryptographically secure opaque refresh token.
 * Returns both the raw token (sent to client once) and its hash (stored in DB).
 */
export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = hashToken(raw);
  return { raw, hash };
}

/** Verify and decode an access token. Throws on expired/invalid. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/** SHA-256 hash a token — used for safe DB storage of refresh tokens */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
