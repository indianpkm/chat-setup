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
declare const router: import("express-serve-static-core").Router;
export default router;
