/**
 * Environment Configuration
 *
 * Validates all required environment variables at startup using Zod.
 * If any required variable is missing or invalid, the process exits immediately.
 */
import 'dotenv/config';
export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    CORS_ORIGINS: string;
    MAX_FILE_SIZE_MB: number;
    UPLOAD_DIR: string;
};
export type Env = typeof env;
