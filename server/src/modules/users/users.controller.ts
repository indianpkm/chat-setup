/**
 * Users Controller
 */

import type { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service.js';
import { sendSuccess } from '../../utils/response.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema } from './users.service.js';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(50),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export async function search(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { q, limit } = searchQuerySchema.parse(req.query);
    const users = await usersService.searchUsers(q, req.user!.id, limit);
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
}

export async function getUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await usersService.getUserById(req.params.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function getPublicKey(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await usersService.getUserPublicKey(req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export const updateMe = [
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await usersService.updateMyProfile(req.user!.id, req.body);
      sendSuccess(res, user, 'Profile updated');
    } catch (err) {
      next(err);
    }
  },
];
