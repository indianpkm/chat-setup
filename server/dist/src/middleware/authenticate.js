/**
 * JWT Authentication Middleware
 *
 * Extracts and verifies the Bearer token from the Authorization header.
 * Populates req.user on success; returns 401 on failure.
 *
 * Usage: router.get('/protected', authenticate, handler)
 */
import jwt from 'jsonwebtoken';
const { JsonWebTokenError, TokenExpiredError } = jwt;
import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
export async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        sendError(res, 'Missing or invalid Authorization header', 401);
        return;
    }
    const token = authHeader.slice(7); // Remove "Bearer " prefix
    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.sub, email: payload.email };
        next();
    }
    catch (err) {
        if (err instanceof TokenExpiredError) {
            sendError(res, 'Access token expired', 401);
        }
        else if (err instanceof JsonWebTokenError) {
            sendError(res, 'Invalid access token', 401);
        }
        else {
            next(err);
        }
    }
}
//# sourceMappingURL=authenticate.js.map