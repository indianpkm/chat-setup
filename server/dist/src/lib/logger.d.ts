/**
 * Pino Logger Singleton
 *
 * - Production: raw JSON (fast, structured, log-aggregator friendly)
 * - Development: pino-pretty (colorized, human-readable)
 * - Redacts sensitive fields before outputting
 */
import pino from 'pino';
export declare const logger: pino.Logger<never, boolean>;
