/**
 * Media Utility Functions
 *
 * Helpers for file validation, naming, and type classification.
 */
import path from 'path';
import crypto from 'crypto';
import { CONSTANTS } from '../config/constants.js';
/** Returns true if the MIME type is on the allowlist */
export function isAllowedMimeType(mimeType) {
    return CONSTANTS.ALLOWED_MIME_TYPES.includes(mimeType);
}
/**
 * Generate a unique, collision-resistant filename.
 * Format: {timestamp}-{16-byte-hex}{original-extension}
 */
export function generateUniqueFilename(originalName) {
    const ext = path.extname(originalName).toLowerCase();
    const unique = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${unique}${ext}`;
}
/**
 * Map a MIME type to a ContentType enum value.
 * Matches the Prisma ContentType enum.
 */
export function getContentTypeFromMime(mimeType) {
    if (mimeType.startsWith('image/'))
        return 'IMAGE';
    if (mimeType.startsWith('video/'))
        return 'VIDEO';
    if (mimeType.startsWith('audio/'))
        return 'AUDIO';
    return 'FILE';
}
/** Human-readable file size (e.g. "2.4 MB") */
export function formatFileSize(bytes) {
    if (bytes < 1_024)
        return `${bytes} B`;
    if (bytes < 1_048_576)
        return `${(bytes / 1_024).toFixed(1)} KB`;
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
}
/** Sanitize a filename to prevent path traversal */
export function sanitizeFilename(filename) {
    return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}
//# sourceMappingURL=media.js.map