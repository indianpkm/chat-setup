/**
 * Messages Controller
 */

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from './messages.service.js';
import { sendSuccess } from '../../utils/response.js';

const paginationSchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const editMessageSchema = z.object({
  encryptedContent: z.string().min(1),
  nonce: z.string().min(1),
});

export async function getMessages(
  req: Request<{ conversationId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { cursor, limit } = paginationSchema.parse(req.query);
    const result = await service.getMessages(
      req.params.conversationId,
      req.user!.id,
      cursor,
      limit,
    );
    sendSuccess(res, result.messages, 'Messages retrieved', 200, {
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.deleteMessage(req.params.id, req.user!.id);
    sendSuccess(res, result, 'Message deleted');
  } catch (err) {
    next(err);
  }
}

export async function editMessage(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { encryptedContent, nonce } = editMessageSchema.parse(req.body);
    const message = await service.editMessage(
      req.params.id,
      req.user!.id,
      encryptedContent,
      nonce,
    );
    sendSuccess(res, message, 'Message updated');
  } catch (err) {
    next(err);
  }
}
