/**
 * Media Utility Functions
 *
 * Helpers for file validation, naming, and type classification.
 */
/** Returns true if the MIME type is on the allowlist */
export declare function isAllowedMimeType(mimeType: string): boolean;
/**
 * Generate a unique, collision-resistant filename.
 * Format: {timestamp}-{16-byte-hex}{original-extension}
 */
export declare function generateUniqueFilename(originalName: string): string;
/**
 * Map a MIME type to a ContentType enum value.
 * Matches the Prisma ContentType enum.
 */
export declare function getContentTypeFromMime(mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
/** Human-readable file size (e.g. "2.4 MB") */
export declare function formatFileSize(bytes: number): string;
/** Sanitize a filename to prevent path traversal */
export declare function sanitizeFilename(filename: string): string;
