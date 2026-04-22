/**
 * Standardized API Response Helpers
 *
 * All REST endpoints use these helpers to ensure a consistent shape:
 *   { success, message, data?, meta?, errors? }
 */
/** 2xx success response */
export function sendSuccess(res, data, message = 'Success', statusCode = 200, meta) {
    const body = { success: true, message, data };
    if (meta)
        body.meta = meta;
    return res.status(statusCode).json(body);
}
/** 201 Created */
export function sendCreated(res, data, message = 'Created successfully') {
    return sendSuccess(res, data, message, 201);
}
/** 4xx / 5xx error response */
export function sendError(res, message, statusCode = 500, errors) {
    const body = { success: false, message };
    if (errors !== undefined)
        body.errors = errors;
    return res.status(statusCode).json(body);
}
/** Cursor-based paginated list response */
export function sendPaginatedCursor(res, data, hasMore, nextCursor, message = 'Success') {
    return sendSuccess(res, data, message, 200, { hasMore, nextCursor });
}
/** Offset-based paginated list response */
export function sendPaginatedOffset(res, data, total, page, limit, message = 'Success') {
    return sendSuccess(res, data, message, 200, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
}
//# sourceMappingURL=response.js.map