/**
 * Calls Service
 *
 * REST companion to the WebRTC signaling handled via Socket.IO.
 * The service manages call records in the database — Socket.IO handles
 * the real-time signaling (offer/answer/ICE).
 */
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
const callSelect = {
    id: true,
    conversationId: true,
    callType: true,
    status: true,
    initiatorId: true,
    startedAt: true,
    endedAt: true,
    participants: {
        select: {
            userId: true,
            joinedAt: true,
            leftAt: true,
            isVideoEnabled: true,
            isAudioEnabled: true,
            user: { select: { id: true, username: true, avatar: true } },
        },
    },
    initiator: { select: { id: true, username: true, avatar: true } },
};
export async function getCallById(callId, userId) {
    const call = await prisma.call.findFirst({
        where: {
            id: callId,
            participants: { some: { userId } },
        },
        select: callSelect,
    });
    if (!call)
        throw new AppError('Call not found', 404);
    return call;
}
export async function getUserCallHistory(userId, limit = 20, cursor) {
    const calls = await prisma.call.findMany({
        where: {
            participants: { some: { userId } },
            ...(cursor ? { startedAt: { lt: new Date(cursor) } } : {}),
        },
        orderBy: { startedAt: 'desc' },
        take: limit + 1,
        select: callSelect,
    });
    const hasMore = calls.length > limit;
    if (hasMore)
        calls.pop();
    return {
        calls,
        hasMore,
        nextCursor: hasMore ? calls[calls.length - 1]?.startedAt.toISOString() : null,
    };
}
export async function updateCallStatus(callId, userId, status) {
    const call = await prisma.call.findFirst({
        where: { id: callId, participants: { some: { userId } } },
        select: { id: true, status: true },
    });
    if (!call)
        throw new AppError('Call not found', 404);
    return prisma.call.update({
        where: { id: callId },
        data: {
            status,
            ...(status === 'ENDED' || status === 'REJECTED'
                ? { endedAt: new Date() }
                : {}),
        },
        select: callSelect,
    });
}
/** Create a call record — called from Socket.IO handler, also exposed here for REST */
export async function createCall(conversationId, initiatorId, callType) {
    // Verify membership
    const membership = await prisma.conversationParticipant.findUnique({
        where: {
            conversationId_userId: { conversationId, userId: initiatorId },
        },
    });
    if (!membership || membership.leftAt) {
        throw new AppError('Not a member of this conversation', 403);
    }
    return prisma.call.create({
        data: {
            conversationId,
            callType,
            status: 'PENDING',
            initiatorId,
            participants: {
                create: [
                    {
                        userId: initiatorId,
                        isAudioEnabled: true,
                        isVideoEnabled: callType === 'VIDEO',
                    },
                ],
            },
        },
        select: callSelect,
    });
}
//# sourceMappingURL=calls.service.js.map