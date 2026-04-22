/**
 * Messages Routes
 *
 * GET    /api/conversations/:conversationId/messages — Paginated message history
 * PATCH  /api/messages/:id                          — Edit message (new ciphertext)
 * DELETE /api/messages/:id                          — Soft-delete message
 */
import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as controller from './messages.controller.js';
const router = Router();
router.use(authenticate);
// Nested under conversations
router.get('/conversations/:conversationId/messages', controller.getMessages);
// Standalone message operations
router.patch('/:id', controller.editMessage);
router.delete('/:id', controller.deleteMessage);
export default router;
//# sourceMappingURL=messages.routes.js.map