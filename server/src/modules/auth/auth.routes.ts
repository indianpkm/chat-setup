/**
 * Auth Routes
 *
 * POST /api/auth/register  — Create account + receive tokens
 * POST /api/auth/login     — Login + receive tokens
 * POST /api/auth/refresh   — Rotate refresh token
 * POST /api/auth/logout    — Revoke refresh token
 * GET  /api/auth/me        — Get current authenticated user
 */

import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import * as controller from './auth.controller.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from './auth.schema.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  controller.register,
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  controller.login,
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  controller.refresh,
);

router.post(
  '/logout',
  validate(logoutSchema),
  controller.logout,
);

router.get(
  '/me',
  authenticate,
  controller.me,
);

export default router;
