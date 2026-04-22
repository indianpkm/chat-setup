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

export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body',
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      // Pass ZodError to the global errorHandler — it formats as 422
      next(result.error);
      return;
    }

    // Overwrite with transformed/coerced values
    (req as any)[target] = result.data;
    next();
  };
}
