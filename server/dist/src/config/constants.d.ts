/**
 * Application-wide constants.
 * Never hard-code these values anywhere else — always reference from here.
 */
export declare const CONSTANTS: {
    /** bcrypt cost factor — 12 rounds (~250ms on modern hardware) */
    readonly BCRYPT_ROUNDS: 12;
    /** Refresh token validity in milliseconds (7 days) */
    readonly REFRESH_TOKEN_EXPIRY_MS: number;
    /** Maximum characters allowed in a single message */
    readonly MAX_MESSAGE_LENGTH: 4096;
    /** Maximum members per group conversation */
    readonly MAX_GROUP_MEMBERS: 256;
    /** How long a user is considered online (seconds) after their last heartbeat */
    readonly PRESENCE_TTL_SECONDS: 70;
    /** How long a "typing" indicator lasts in Redis (seconds) before auto-expiring */
    readonly TYPING_TTL_SECONDS: 5;
    /**
     * Rate limiting configurations.
     * points: max requests, duration: window in seconds.
     */
    readonly RATE_LIMIT: {
        /** Auth endpoints — 5 req / 60s per IP */
        readonly AUTH: {
            readonly points: 5;
            readonly duration: 60;
        };
        /** General API endpoints — 120 req / 60s per user/IP */
        readonly API: {
            readonly points: 120;
            readonly duration: 60;
        };
        /** Socket message events — 30 msgs / second per user */
        readonly SOCKET_MSG: {
            readonly points: 30;
            readonly duration: 1;
        };
    };
    /** Allowed MIME types for media uploads */
    readonly ALLOWED_MIME_TYPES: readonly string[];
    /** Pagination defaults */
    readonly PAGINATION: {
        readonly DEFAULT_LIMIT: 50;
        readonly MAX_LIMIT: 100;
    };
};
