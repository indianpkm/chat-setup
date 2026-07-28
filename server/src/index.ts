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

import { createServer } from 'http';
import { env } from './config/env.js'; // Validates env — exits if invalid
import { logger } from './lib/logger.js';
import { connectRedis, disconnectRedis } from './lib/redis.js';
import { connectDB, disconnectDB } from './lib/prisma.js';
import { startWorkers, stopWorkers } from './jobs/queues.js';
import { initSocketServer, getIO } from './socket/index.js';
import app from './app.js';

const httpServer = createServer(app);

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function bootstrap(): Promise<void> {
  logger.info({ env: env.NODE_ENV, port: env.PORT }, 'Starting server...');

  // 1. Redis (must come before Socket.IO init and rate limiters)
  await connectRedis();

  // 2. Database
  await connectDB();

  // 3. BullMQ workers
  await startWorkers();

  // 4. Socket.IO (uses Redis pub/sub connections)
  initSocketServer(httpServer);

  // 5. HTTP server
  await new Promise<void>((resolve) => {
    httpServer.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
          pid: process.pid,
        },
        `🚀 Server ready on http://localhost:${env.PORT}`,
      );
      resolve();
    });
  });
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, 'Graceful shutdown initiated');

  // Force-exit if graceful shutdown takes too long
  const forceExitTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 30_000).unref();

  try {
    // 1. Stop accepting new HTTP connections
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => (err ? reject(err) : resolve()));
    });
    logger.info('HTTP server closed');

    // 2. Drain and stop BullMQ workers
    await stopWorkers();

    // 3. Close Socket.IO server
    try {
      getIO().close();
      logger.info('Socket.IO server closed');
    } catch (err) {
      logger.warn({ err }, 'Error closing Socket.IO server or not initialized');
    }

    // 4. Disconnect infrastructure
    await Promise.all([disconnectRedis(), disconnectDB()]);

    clearTimeout(forceExitTimer);
    logger.info('Graceful shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Process event handlers
// ---------------------------------------------------------------------------

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — terminating');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection — terminating');
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Fatal error during bootstrap');
  process.exit(1);
});