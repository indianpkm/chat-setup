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
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
// Feature routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import conversationsRoutes from './modules/conversations/conversations.routes.js';
import messagesRoutes from './modules/messages/messages.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import callsRoutes from './modules/calls/calls.routes.js';
const app = express();
// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------
app.use(helmet({
    // Allow embedding in same origin (for WebRTC)
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", 'wss:', 'ws:'],
            mediaSrc: ["'self'"],
        },
    },
}));
const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: Origin "${origin}" not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Retry-After'],
}));
// ---------------------------------------------------------------------------
// Request logging
// ---------------------------------------------------------------------------
app.use(pinoHttp({
    logger,
    // Skip health check logs — noisy in production
    autoLogging: {
        ignore: (req) => req.url === '/health',
    },
    customLogLevel: (_req, res) => {
        if (res.statusCode >= 500)
            return 'error';
        if (res.statusCode >= 400)
            return 'warn';
        return 'info';
    },
}));
// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
// ---------------------------------------------------------------------------
// Static file serving (uploaded media)
// ---------------------------------------------------------------------------
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR), {
    maxAge: '1d', // Client-side caching for media files
    etag: true,
}));
// ---------------------------------------------------------------------------
// Health check (no auth, no rate limit — used by Docker healthcheck)
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        env: env.NODE_ENV,
    });
});
// ---------------------------------------------------------------------------
// API routes (global rate limiter applied to all /api/* routes)
// ---------------------------------------------------------------------------
app.use('/api', apiRateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api', messagesRoutes); // Handles /api/conversations/:id/messages + /api/messages/:id
app.use('/api/media', mediaRoutes);
app.use('/api/calls', callsRoutes);
// ---------------------------------------------------------------------------
// Error handling (must be last)
// ---------------------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map