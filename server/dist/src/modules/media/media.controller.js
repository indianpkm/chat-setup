/**
 * Media Controller
 */
import { processUpload } from './media.service.js';
import { sendCreated, sendError } from '../../utils/response.js';
import { mediaQueue } from '../../jobs/queues.js';
export async function uploadMedia(req, res, next) {
    try {
        if (!req.file) {
            sendError(res, 'No file uploaded', 400);
            return;
        }
        const result = processUpload(req.file);
        // Queue media processing job (resize images, video thumbnail etc.)
        await mediaQueue.add('process-upload', {
            filename: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user.id,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: 100, // Keep last 100 failed jobs for debugging
        });
        sendCreated(res, result, 'File uploaded successfully');
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=media.controller.js.map