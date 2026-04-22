/**
 * Express Application
 *
 * Sets up the Express app with all middleware and routes.
 * The HTTP server and Socket.IO initialization happen in index.ts.
 *
 * Middleware order (critical — must not reorder):
 *   1. helmet       — Security headers first
 *   2. cors         — CORS before any route handler
 *   3. pino-http    — Request logging (after CORS so CORS headers appear in logs)
 *   4. body parsing — Before route handlers
 *   5. static files — Serve uploads directory
 *   6. API rate limiter — Applied to /api/* globally
 *   7. Routes       — Feature routes
 *   8. 404 handler  — After all routes
 *   9. Error handler — Must be last (4 params)
 */
declare const app: import("express-serve-static-core").Express;
export default app;
