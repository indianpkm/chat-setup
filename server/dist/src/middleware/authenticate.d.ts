/**
 * JWT Authentication Middleware
 *
 * Extracts and verifies the Bearer token from the Authorization header.
 * Populates req.user on success; returns 401 on failure.
 *
 * Usage: router.get('/protected', authenticate, handler)
 */
import type { Request, Response, NextFunction } from 'express';
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
