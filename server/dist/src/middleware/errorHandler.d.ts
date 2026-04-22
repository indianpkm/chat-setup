/**
 * Global Error Handler Middleware
 *
 * Catches all errors passed to next(err) and formats them into
 * a consistent API response. Never leaks stack traces in production.
 *
 * Handled error types:
 *   - AppError       — intentional operational errors (4xx)
 *   - ZodError       — validation failures (422)
 *   - Prisma errors  — DB constraint violations (409, 404)
 *   - Unknown        — logged as fatal, returns 500
 */
import type { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare function notFoundHandler(req: Request, res: Response): void;
export declare function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void;
