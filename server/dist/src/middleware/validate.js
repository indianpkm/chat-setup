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
export function validate(schema, target = 'body') {
    return (req, _res, next) => {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
            // Pass ZodError to the global errorHandler — it formats as 422
            next(result.error);
            return;
        }
        // Overwrite with transformed/coerced values
        req[target] = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map