/**
 * Prisma Client Singleton (Updated)
 *
 * - PgAdapter for native PostgreSQL driver performance
 * - Query insights for tracing slow queries
 * - Dev-only query event logging via Pino
 * - Exported connectDB() for explicit connection verification at startup
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log:
    env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'info' },
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'error' },
        ]
      : [
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'error' },
        ],
  comments: [prismaQueryInsights()],
});

// Log slow queries in development
if (env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(
      {
        query: e.query,
        params: e.params,
        durationMs: e.duration,
      },
      'Prisma query',
    );
  });
}

/** Verify database connectivity — called once at startup */
export async function connectDB(): Promise<void> {
  await prisma.$connect();
  logger.info('Database connected successfully');
}

/** Gracefully close the database connection */
export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}