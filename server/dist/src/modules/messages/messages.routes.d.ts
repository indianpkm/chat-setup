/**
 * Messages Routes
 *
 * GET    /api/conversations/:conversationId/messages — Paginated message history
 * PATCH  /api/messages/:id                          — Edit message (new ciphertext)
 * DELETE /api/messages/:id                          — Soft-delete message
 */
declare const router: import("express-serve-static-core").Router;
export default router;
