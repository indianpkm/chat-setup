/**
 * Users Routes
 *
 * GET   /api/users?q=        — Search users by username/email
 * GET   /api/users/:id       — Get user public profile
 * GET   /api/users/:id/public-key — Get user's X25519 public key (for E2E)
 * PATCH /api/users/me        — Update own profile
 */
declare const router: import("express-serve-static-core").Router;
export default router;
