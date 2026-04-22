/**
 * Redis-Backed Rate Limiters
 *
 * Uses rate-limiter-flexible with ioredis for accurate, distributed rate limiting
 * that works correctly across multiple Node.js instances (horizontal scaling).
 *
 * Strategies:
 *  - authLimiter:   Per-IP, strict   — protects login/register from brute force
 *  - apiLimiter:    Per-user/IP      — general API throttle
 *  - socketLimiter: Per-userId only  — used inside socket handlers
 */
import type { Request, Response, NextFunction } from 'express';
/**
 * Strict rate limiter for authentication endpoints.
 * 5 requests / 60s per IP. Blocked for 5 minutes after exceeded.
 */
export declare function authRateLimiter(req: Request, res: Response, next: NextFunction): void;
/**
 * General API rate limiter.
 * 120 requests / 60s per authenticated userId (falls back to IP).
 */
export declare function apiRateLimiter(req: Request, res: Response, next: NextFunction): void;
/**
 * Socket message rate limiter — call this inside socket event handlers.
 * Returns true if allowed, false if rate-limited.
 */
export declare function checkSocketMessageLimit(userId: string): Promise<boolean>;
