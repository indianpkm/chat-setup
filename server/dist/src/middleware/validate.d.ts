/**
 * Zod Request Validation Middleware
 *
 * Validates req.body, req.query, or req.params against a Zod schema.
 * On success, replaces the target with the parsed (and possibly transformed) data.
 * On failure, passes the ZodError to the global error handler (returns 422).
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), controller)
 *   router.get('/users', validate(searchQuerySchema, 'query'), controller)
 */
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
type ValidationTarget = 'body' | 'query' | 'params';
export declare function validate(schema: ZodSchema, target?: ValidationTarget): (req: Request, _res: Response, next: NextFunction) => void;
export {};
