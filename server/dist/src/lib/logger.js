/**
 * Pino Logger Singleton
 *
 * - Production: raw JSON (fast, structured, log-aggregator friendly)
 * - Development: pino-pretty (colorized, human-readable)
 * - Redacts sensitive fields before outputting
 */
import pino from 'pino';
import { env } from '../config/env.js';
export const logger = pino({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    // Redact sensitive fields from all log output
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'body.password',
            'body.passwordHash',
            'body.refreshToken',
            '*.passwordHash',
        ],
        censor: '[REDACTED]',
    },
    base: {
        env: env.NODE_ENV,
        pid: process.pid,
    },
    // Human-readable output in development
    ...(env.NODE_ENV !== 'production' && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                ignore: 'pid,hostname,env',
                singleLine: false,
            },
        },
    }),
});
//# sourceMappingURL=logger.js.map