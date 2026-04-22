/**
 * Auth Controller
 *
 * Thin layer between routes and service — no business logic here.
 * Handles request/response transformation only.
 */

import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  LogoutInput,
} from './auth.schema.js';

export async function register(
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.registerUser(req.body);
    sendCreated(res, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.loginUser(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request<object, object, RefreshTokenInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tokens = await authService.refreshTokens(req.body);
    sendSuccess(res, tokens, 'Tokens refreshed');
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request<object, object, LogoutInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.logoutUser(req.body.refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
