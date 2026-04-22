/**
 * Conversations Routes
 *
 * GET    /api/conversations                              — List all my conversations
 * POST   /api/conversations/dm                          — Get or create a DM
 * POST   /api/conversations/group                       — Create a group
 * GET    /api/conversations/:id                         — Get conversation details
 * PATCH  /api/conversations/:id                         — Update group (admins only)
 * DELETE /api/conversations/:id/leave                   — Leave group
 * POST   /api/conversations/:id/participants            — Add participants (admins only)
 * DELETE /api/conversations/:id/participants/:userId    — Remove participant (admins only)
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './conversations.controller.js';
import {
  createDMSchema,
  createGroupSchema,
  updateGroupSchema,
  addParticipantsSchema,
} from './conversations.service.js';

const router = Router();

router.use(authenticate);

router.get('/', controller.listConversations);
router.post('/dm', validate(createDMSchema), controller.createDM);
router.post('/group', validate(createGroupSchema), controller.createGroup);

router.get('/:id', controller.getConversation);
router.patch('/:id', validate(updateGroupSchema), controller.updateGroup);
router.delete('/:id/leave', controller.leaveConversation);

router.post(
  '/:id/participants',
  validate(addParticipantsSchema),
  controller.addParticipants,
);
router.delete(
  '/:id/participants/:userId',
  controller.removeParticipant,
);

export default router;
