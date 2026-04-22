/**
 * Media Routes
 *
 * POST /api/media/upload — Upload a media file
 *   - Requires: multipart/form-data, field name "file"
 *   - Returns: { url, mimeType, size, contentType, filename }
 *   - Client then sends this URL in the Socket.IO msg:send mediaUrl field
 */
declare const router: import("express-serve-static-core").Router;
export default router;
