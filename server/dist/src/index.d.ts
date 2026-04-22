/**
 * Application Entry Point
 *
 * Startup sequence (order matters):
 *   1. Validate environment (fails fast if .env is misconfigured)
 *   2. Connect Redis (required by Socket.IO adapter + rate limiter + jobs)
 *   3. Connect PostgreSQL via Prisma
 *   4. Start BullMQ background workers
 *   5. Initialize Socket.IO server (attaches to HTTP server)
 *   6. Start listening on PORT
 *
 * Graceful shutdown on SIGTERM / SIGINT:
 *   - Stop accepting new connections
 *   - Wait for in-flight requests to complete (30s timeout)
 *   - Drain BullMQ workers
 *   - Close Redis and PostgreSQL connections
 */
export {};
