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
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { getRedisClient } from '../lib/redis.js';
import { sendError } from '../utils/response.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../lib/logger.js';

// ---------------------------------------------------------------------------
// Limiter factory
// ---------------------------------------------------------------------------

function createLimiter(
  keyPrefix: string,
  points: number,
  duration: number,
  blockDuration?: number,
): RateLimiterRedis {
  return new RateLimiterRedis({
    storeClient: getRedisClient(),
    keyPrefix,
    points,
    duration,
    blockDuration: blockDuration ?? duration,
    // In-memory insurance: allow burst of 2x before Redis is consulted
    inMemoryBlockOnConsumed: points + 1,
    inMemoryBlockDuration: duration,
  });
}

// Lazy-initialized singletons (Redis must be connected before first use)
let _authLimiter: RateLimiterRedis | null = null;
let _apiLimiter: RateLimiterRedis | null = null;
let _socketMsgLimiter: RateLimiterRedis | null = null;
let _socketEventLimiter: RateLimiterRedis | null = null;

function getAuthLimiter(): RateLimiterRedis {
  return (_authLimiter ??= createLimiter(
    'rl:auth',
    CONSTANTS.RATE_LIMIT.AUTH.points,
    CONSTANTS.RATE_LIMIT.AUTH.duration,
    300, // Block for 5 minutes after exceeding auth limit
  ));
}

function getApiLimiter(): RateLimiterRedis {
  return (_apiLimiter ??= createLimiter(
    'rl:api',
    CONSTANTS.RATE_LIMIT.API.points,
    CONSTANTS.RATE_LIMIT.API.duration,
  ));
}

function getSocketMsgLimiter(): RateLimiterRedis {
  return (_socketMsgLimiter ??= createLimiter(
    'rl:socket:msg',
    CONSTANTS.RATE_LIMIT.SOCKET_MSG.points,
    CONSTANTS.RATE_LIMIT.SOCKET_MSG.duration,
  ));
}

function getSocketEventLimiter(): RateLimiterRedis {
  return (_socketEventLimiter ??= createLimiter(
    'rl:socket:event',
    100, // 100 events
    60,  // per 60 seconds
  ));
}

// ---------------------------------------------------------------------------
// Express middleware
// ---------------------------------------------------------------------------

/**
 * Strict rate limiter for authentication endpoints.
 * 5 requests / 60s per IP. Blocked for 5 minutes after exceeded.
 */
export function authRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const key = req.ip ?? 'unknown';

  getAuthLimiter()
    .consume(key)
    .then(() => next())
    .catch((err: unknown) => {
      if (err instanceof RateLimiterRes) {
        const retrySecs = Math.ceil(err.msBeforeNext / 1000);
        res.setHeader('Retry-After', String(retrySecs));
        logger.warn({ ip: key }, 'Auth rate limit exceeded');
        sendError(
          res,
          `Too many attempts. Try again in ${retrySecs} seconds.`,
          429,
        );
      } else {
        // Redis failure — fail open to avoid blocking legitimate users
        logger.error({ err }, 'Rate limiter Redis error — failing open');
        next();
      }
    });
}

/**
 * General API rate limiter.
 * 120 requests / 60s per authenticated userId (falls back to IP).
 */
export function apiRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const key = (req as any).user?.id ?? req.ip ?? 'unknown';

  getApiLimiter()
    .consume(key)
    .then(() => next())
    .catch((err: unknown) => {
      if (err instanceof RateLimiterRes) {
        const retrySecs = Math.ceil(err.msBeforeNext / 1000);
        res.setHeader('Retry-After', String(retrySecs));
        sendError(
          res,
          `Rate limit exceeded. Try again in ${retrySecs} seconds.`,
          429,
        );
      } else {
        logger.error({ err }, 'Rate limiter Redis error — failing open');
        next();
      }
    });
}

// ---------------------------------------------------------------------------
// Socket utilities
// ---------------------------------------------------------------------------

/**
 * Socket message rate limiter — call this inside socket event handlers.
 * Returns true if allowed, false if rate-limited.
 */
export async function checkSocketMessageLimit(
  userId: string,
): Promise<boolean> {
  try {
    await getSocketMsgLimiter().consume(userId);
    return true;
  } catch {
    return false;
  }
}

/**
 * General socket event rate limiter.
 */
export async function checkSocketEventLimit(
  userId: string,
): Promise<boolean> {
  try {
    await getSocketEventLimiter().consume(userId);
    return true;
  } catch {
    return false;
  }
}
