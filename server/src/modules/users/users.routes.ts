/**
 * Users Routes
 *
 * GET   /api/users?q=        — Search users by username/email
 * GET   /api/users/:id       — Get user public profile
 * GET   /api/users/:id/public-key — Get user's X25519 public key (for E2E)
 * PATCH /api/users/me        — Update own profile
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as controller from './users.controller.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/', controller.search);
router.get('/me', async (req, res, next) => {
  // Alias — returns my own profile
  req.params = Object.assign(req.params || {}, { id: req.user!.id });
  return controller.getUser(req as any, res, next);
});
router.patch('/me', ...controller.updateMe);
router.get('/:id', controller.getUser);
router.get('/:id/public-key', controller.getPublicKey);

export default router;
