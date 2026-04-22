/**
 * Media Service + Multer Configuration
 *
 * Handles file upload, validation, and metadata persistence.
 *
 * Storage strategy:
 *   - Development: local disk (./uploads/)
 *   - Production: swap `storage` for S3/R2/MinIO adapter
 *
 * Security:
 *   - MIME type allowlist checked BEFORE writing to disk
 *   - Filename sanitized — no path traversal possible
 *   - Max file size enforced at Multer level (before content reaches Express)
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';
import { isAllowedMimeType, generateUniqueFilename, getContentTypeFromMime, } from '../../utils/media.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ---------------------------------------------------------------------------
// Ensure upload directory exists
// ---------------------------------------------------------------------------
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// ---------------------------------------------------------------------------
// Multer configuration
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, generateUniqueFilename(file.originalname)),
});
const fileFilter = (_req, file, cb) => {
    if (!isAllowedMimeType(file.mimetype)) {
        cb(new AppError(`File type "${file.mimetype}" is not allowed`, 415), false);
        return;
    }
    cb(null, true);
};
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
        files: 1, // One file per request
    },
});
/**
 * Process an uploaded file — returns metadata for the client to embed
 * into the message payload before sending via Socket.IO.
 */
export function processUpload(file) {
    const contentType = getContentTypeFromMime(file.mimetype);
    // URL clients will use to fetch the file
    const url = `/uploads/${file.filename}`;
    return {
        url,
        mimeType: file.mimetype,
        size: file.size,
        contentType,
        filename: file.originalname,
    };
}
/**
 * Attach a Media record to an existing message.
 * Called after the message is sent via Socket.IO and message ID is known.
 */
export async function attachMediaToMessage(messageId, file, dimensions) {
    return prisma.media.create({
        data: {
            messageId,
            url: file.url,
            mimeType: file.mimeType,
            size: file.size,
            width: dimensions?.width,
            height: dimensions?.height,
            duration: dimensions?.duration,
        },
    });
}
/** Delete a media file from disk */
export async function deleteMediaFile(filename) {
    const filePath = path.join(uploadDir, path.basename(filename));
    try {
        await fs.promises.unlink(filePath);
    }
    catch {
        // File may already be deleted — not critical
    }
}
//# sourceMappingURL=media.service.js.map