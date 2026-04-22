/**
 * Prisma Client Singleton (Updated)
 *
 * - PgAdapter for native PostgreSQL driver performance
 * - Query insights for tracing slow queries
 * - Dev-only query event logging via Pino
 * - Exported connectDB() for explicit connection verification at startup
 */
export declare const prisma: import("../../generated/prisma/internal/class.js").PrismaClient<"error" | "info" | "warn" | "query", import("../../generated/prisma/internal/prismaNamespace.js").GlobalOmitConfig | undefined, import("@prisma/client/runtime/client").DefaultArgs>;
/** Verify database connectivity — called once at startup */
export declare function connectDB(): Promise<void>;
/** Gracefully close the database connection */
export declare function disconnectDB(): Promise<void>;
