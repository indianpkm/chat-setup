/**
 * Auth Routes
 *
 * POST /api/auth/register  — Create account + receive tokens
 * POST /api/auth/login     — Login + receive tokens
 * POST /api/auth/refresh   — Rotate refresh token
 * POST /api/auth/logout    — Revoke refresh token
 * GET  /api/auth/me        — Get current authenticated user
 */
declare const router: import("express-serve-static-core").Router;
export default router;
