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
import multer from 'multer';
export declare const upload: multer.Multer;
export interface UploadedMediaResult {
    url: string;
    mimeType: string;
    size: number;
    contentType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
    filename: string;
}
/**
 * Process an uploaded file — returns metadata for the client to embed
 * into the message payload before sending via Socket.IO.
 */
export declare function processUpload(file: Express.Multer.File): UploadedMediaResult;
/**
 * Attach a Media record to an existing message.
 * Called after the message is sent via Socket.IO and message ID is known.
 */
export declare function attachMediaToMessage(messageId: string, file: UploadedMediaResult, dimensions?: {
    width?: number;
    height?: number;
    duration?: number;
}): Promise<{
    url: string;
    id: string;
    createdAt: Date;
    messageId: string;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
    duration: number | null;
}>;
/** Delete a media file from disk */
export declare function deleteMediaFile(filename: string): Promise<void>;
