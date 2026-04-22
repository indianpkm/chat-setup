/**
 * Calls Controller + Routes
 *
 * GET /api/calls/history        — My call history (paginated)
 * GET /api/calls/:id            — Get a specific call record
 */
import { Router } from 'express';
import * as service from './calls.service.js';
import { sendSuccess } from '../../utils/response.js';
import { authenticate } from '../../middleware/authenticate.js';
import { z } from 'zod';
const historyQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(50).default(20),
    cursor: z.string().datetime().optional(),
});
async function getCallHistory(req, res, next) {
    try {
        const { limit, cursor } = historyQuerySchema.parse(req.query);
        const result = await service.getUserCallHistory(req.user.id, limit, cursor);
        sendSuccess(res, result.calls, 'Call history retrieved', 200, {
            hasMore: result.hasMore,
            nextCursor: result.nextCursor,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getCall(req, res, next) {
    try {
        const call = await service.getCallById(req.params.id, req.user.id);
        sendSuccess(res, call);
    }
    catch (err) {
        next(err);
    }
}
const router = Router();
router.use(authenticate);
router.get('/history', getCallHistory);
router.get('/:id', getCall);
export default router;
//# sourceMappingURL=calls.routes.js.map