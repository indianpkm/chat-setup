/**
 * Media Routes
 *
 * POST /api/media/upload — Upload a media file
 *   - Requires: multipart/form-data, field name "file"
 *   - Returns: { url, mimeType, size, contentType, filename }
 *   - Client then sends this URL in the Socket.IO msg:send mediaUrl field
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { upload } from './media.service.js';
import * as controller from './media.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/upload',
  upload.single('file'),
  controller.uploadMedia,
);

export default router;
