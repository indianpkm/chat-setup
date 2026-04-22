/**
 * Application-wide constants.
 * Never hard-code these values anywhere else — always reference from here.
 */

export const CONSTANTS = {
  /** bcrypt cost factor — 12 rounds (~250ms on modern hardware) */
  BCRYPT_ROUNDS: 12,

  /** Refresh token validity in milliseconds (7 days) */
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,

  /** Maximum characters allowed in a single message */
  MAX_MESSAGE_LENGTH: 4096,

  /** Maximum members per group conversation */
  MAX_GROUP_MEMBERS: 256,

  /** How long a user is considered online (seconds) after their last heartbeat */
  PRESENCE_TTL_SECONDS: 70,

  /** How long a "typing" indicator lasts in Redis (seconds) before auto-expiring */
  TYPING_TTL_SECONDS: 5,

  /**
   * Rate limiting configurations.
   * points: max requests, duration: window in seconds.
   */
  RATE_LIMIT: {
    /** Auth endpoints — 5 req / 60s per IP */
    AUTH: { points: 5, duration: 60 },
    /** General API endpoints — 120 req / 60s per user/IP */
    API: { points: 120, duration: 60 },
    /** Socket message events — 30 msgs / second per user */
    SOCKET_MSG: { points: 30, duration: 1 },
  },

  /** Allowed MIME types for media uploads */
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as readonly string[],

  /** Pagination defaults */
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
  },
} as const;
