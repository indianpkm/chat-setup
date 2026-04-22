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
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: PaginationMeta,
): Response {
  const body: ApiResponse<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

/** 201 Created */
export function sendCreated<T>(
  res: Response,
  data: T,
  message = 'Created successfully',
): Response {
  return sendSuccess(res, data, message, 201);
}

/** 4xx / 5xx error response */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown,
): Response {
  const body: ApiResponse = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return res.status(statusCode).json(body);
}

/** Cursor-based paginated list response */
export function sendPaginatedCursor<T>(
  res: Response,
  data: T[],
  hasMore: boolean,
  nextCursor: string | null,
  message = 'Success',
): Response {
  return sendSuccess(res, data, message, 200, { hasMore, nextCursor });
}

/** Offset-based paginated list response */
export function sendPaginatedOffset<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success',
): Response {
  return sendSuccess(res, data, message, 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
