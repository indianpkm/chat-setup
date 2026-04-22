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
import { ZodError } from 'zod';
import { Prisma } from '../../generated/prisma/client.js';
import { logger } from '../lib/logger.js';
import { sendError } from '../utils/response.js';
// ---------------------------------------------------------------------------
// AppError — thrown by services/controllers for expected error conditions
// ---------------------------------------------------------------------------
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Restore prototype chain (required when extending built-ins in TS)
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
// ---------------------------------------------------------------------------
// 404 Handler — mount before the global error handler
// ---------------------------------------------------------------------------
export function notFoundHandler(req, res) {
    sendError(res, `Route ${req.method} ${req.path} not found`, 404);
}
// ---------------------------------------------------------------------------
// Global Error Handler — must have 4 parameters (err, req, res, next)
// ---------------------------------------------------------------------------
export function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    // 1. Zod validation errors
    if (err instanceof ZodError) {
        sendError(res, 'Validation failed', 422, err.flatten().fieldErrors);
        return;
    }
    // 2. Intentional application errors
    if (err instanceof AppError) {
        if (!err.isOperational) {
            logger.error({ err, path: req.path, method: req.method }, 'Non-operational AppError');
        }
        sendError(res, err.message, err.statusCode);
        return;
    }
    // 3. Prisma known request errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                sendError(res, 'A record with that value already exists', 409);
                return;
            case 'P2025':
                sendError(res, 'Record not found', 404);
                return;
            case 'P2003':
                sendError(res, 'Related record not found', 400);
                return;
            default:
                logger.error({ err, code: err.code }, 'Unhandled Prisma error');
                sendError(res, 'Database error', 500);
                return;
        }
    }
    // 4. Prisma validation errors (bad data passed to Prisma)
    if (err instanceof Prisma.PrismaClientValidationError) {
        logger.error({ err }, 'Prisma validation error');
        sendError(res, 'Invalid data', 400);
        return;
    }
    // 5. Unknown / unhandled errors
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
    sendError(res, 'Internal server error', 500);
}
//# sourceMappingURL=errorHandler.js.map