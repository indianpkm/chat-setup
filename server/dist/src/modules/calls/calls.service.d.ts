/**
 * Calls Service
 *
 * REST companion to the WebRTC signaling handled via Socket.IO.
 * The service manages call records in the database — Socket.IO handles
 * the real-time signaling (offer/answer/ICE).
 */
import type { CallStatus, CallType } from '../../../generated/prisma/client.js';
export declare function getCallById(callId: string, userId: string): Promise<{
    id: string;
    status: CallStatus;
    participants: {
        user: {
            id: string;
            username: string;
            avatar: string | null;
        };
        userId: string;
        leftAt: Date | null;
        joinedAt: Date;
        isVideoEnabled: boolean;
        isAudioEnabled: boolean;
    }[];
    conversationId: string;
    callType: CallType;
    initiatorId: string;
    startedAt: Date;
    endedAt: Date | null;
    initiator: {
        id: string;
        username: string;
        avatar: string | null;
    };
}>;
export declare function getUserCallHistory(userId: string, limit?: number, cursor?: string): Promise<{
    calls: {
        id: string;
        status: CallStatus;
        participants: {
            user: {
                id: string;
                username: string;
                avatar: string | null;
            };
            userId: string;
            leftAt: Date | null;
            joinedAt: Date;
            isVideoEnabled: boolean;
            isAudioEnabled: boolean;
        }[];
        conversationId: string;
        callType: CallType;
        initiatorId: string;
        startedAt: Date;
        endedAt: Date | null;
        initiator: {
            id: string;
            username: string;
            avatar: string | null;
        };
    }[];
    hasMore: boolean;
    nextCursor: string | null | undefined;
}>;
export declare function updateCallStatus(callId: string, userId: string, status: CallStatus): Promise<{
    id: string;
    status: CallStatus;
    participants: {
        user: {
            id: string;
            username: string;
            avatar: string | null;
        };
        userId: string;
        leftAt: Date | null;
        joinedAt: Date;
        isVideoEnabled: boolean;
        isAudioEnabled: boolean;
    }[];
    conversationId: string;
    callType: CallType;
    initiatorId: string;
    startedAt: Date;
    endedAt: Date | null;
    initiator: {
        id: string;
        username: string;
        avatar: string | null;
    };
}>;
/** Create a call record — called from Socket.IO handler, also exposed here for REST */
export declare function createCall(conversationId: string, initiatorId: string, callType: CallType): Promise<{
    id: string;
    status: CallStatus;
    participants: {
        user: {
            id: string;
            username: string;
            avatar: string | null;
        };
        userId: string;
        leftAt: Date | null;
        joinedAt: Date;
        isVideoEnabled: boolean;
        isAudioEnabled: boolean;
    }[];
    conversationId: string;
    callType: CallType;
    initiatorId: string;
    startedAt: Date;
    endedAt: Date | null;
    initiator: {
        id: string;
        username: string;
        avatar: string | null;
    };
}>;
