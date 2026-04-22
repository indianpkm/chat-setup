/**
 * Standardized API Response Helpers
 *
 * All REST endpoints use these helpers to ensure a consistent shape:
 *   { success, message, data?, meta?, errors? }
 */
import type { Response } from 'express';
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    meta?: PaginationMeta;
    errors?: unknown;
}
export interface PaginationMeta {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
    nextCursor?: string | null;
}
/** 2xx success response */
export declare function sendSuccess<T>(res: Response, data: T, message?: string, statusCode?: number, meta?: PaginationMeta): Response;
/** 201 Created */
export declare function sendCreated<T>(res: Response, data: T, message?: string): Response;
/** 4xx / 5xx error response */
export declare function sendError(res: Response, message: string, statusCode?: number, errors?: unknown): Response;
/** Cursor-based paginated list response */
export declare function sendPaginatedCursor<T>(res: Response, data: T[], hasMore: boolean, nextCursor: string | null, message?: string): Response;
/** Offset-based paginated list response */
export declare function sendPaginatedOffset<T>(res: Response, data: T[], total: number, page: number, limit: number, message?: string): Response;
