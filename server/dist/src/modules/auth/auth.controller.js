/**
 * Auth Controller
 *
 * Thin layer between routes and service — no business logic here.
 * Handles request/response transformation only.
 */
import * as authService from './auth.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
export async function register(req, res, next) {
    try {
        const result = await authService.registerUser(req.body);
        sendCreated(res, result, 'Registration successful');
    }
    catch (err) {
        next(err);
    }
}
export async function login(req, res, next) {
    try {
        const result = await authService.loginUser(req.body);
        sendSuccess(res, result, 'Login successful');
    }
    catch (err) {
        next(err);
    }
}
export async function refresh(req, res, next) {
    try {
        const tokens = await authService.refreshTokens(req.body);
        sendSuccess(res, tokens, 'Tokens refreshed');
    }
    catch (err) {
        next(err);
    }
}
export async function logout(req, res, next) {
    try {
        await authService.logoutUser(req.body.refreshToken);
        sendSuccess(res, null, 'Logged out successfully');
    }
    catch (err) {
        next(err);
    }
}
export async function me(req, res, next) {
    try {
        const user = await authService.getMe(req.user.id);
        sendSuccess(res, user);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map