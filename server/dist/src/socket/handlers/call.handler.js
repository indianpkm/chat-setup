/**
 * WebRTC Call Signaling Handler
 *
 * The server acts as a pure signaling relay — it never processes media streams.
 * All media is sent peer-to-peer via WebRTC after signaling completes.
 *
 * Signaling flow:
 *   1. Caller emits call:initiate → server creates DB record, notifies callee(s)
 *   2. Callee emits call:answer or call:reject
 *   3. Both peers exchange call:offer, call:answer, call:ice-candidate via server relay
 *   4. Either peer emits call:end to terminate
 *
 * Group calls: each new participant goes through the same offer/answer with existing peers.
 * Rooms: call:{callId} — all call participants join this room for ICE relay.
 */
import { prisma } from '../../lib/prisma.js';
import { createCall } from '../../modules/calls/calls.service.js';
import { logger } from '../../lib/logger.js';
export function registerCallHandlers(io, socket) {
    const userId = socket.data.userId;
    // -------------------------------------------------------------------------
    // call:initiate — Start a call
    // -------------------------------------------------------------------------
    socket.on('call:initiate', async ({ conversationId, callType }, ack) => {
        try {
            const call = await createCall(conversationId, userId, callType);
            // Join initiator to call room for ICE relay
            socket.join(`call:${call.id}`);
            // Fetch caller info for notification payload
            const caller = await prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, avatar: true },
            });
            // Get all conversation members (excluding caller)
            const targets = await prisma.conversationParticipant.findMany({
                where: { conversationId, leftAt: null, userId: { not: userId } },
                select: { userId: true },
            });
            // Notify each target via their personal room
            for (const { userId: targetId } of targets) {
                io.to(`user:${targetId}`).emit('call:incoming', {
                    callId: call.id,
                    callerId: userId,
                    callerName: caller?.username ?? 'Unknown',
                    callerAvatar: caller?.avatar ?? null,
                    callType,
                    conversationId,
                });
            }
            ack({ success: true, data: { callId: call.id } });
        }
        catch (err) {
            logger.error({ err, userId }, 'call:initiate error');
            ack({ success: false, error: 'Failed to initiate call' });
        }
    });
    // -------------------------------------------------------------------------
    // call:offer — Relay SDP offer to a specific peer
    // -------------------------------------------------------------------------
    socket.on('call:offer', ({ callId, targetUserId, sdp }) => {
        io.to(`user:${targetUserId}`).emit('call:offer', {
            callId,
            sdp,
            from: userId,
        });
        // Add answering peer to call room if not already there
        io.in(`user:${targetUserId}`).socketsJoin(`call:${callId}`);
    });
    // -------------------------------------------------------------------------
    // call:answer — Relay SDP answer back to the initiator
    // -------------------------------------------------------------------------
    socket.on('call:answer', async ({ callId, sdp }) => {
        try {
            // Mark call as active on first answer
            await prisma.call.update({
                where: { id: callId },
                data: { status: 'ACTIVE' },
            });
            // Add this participant to DB
            await prisma.callParticipant.upsert({
                where: { callId_userId: { callId, userId } },
                create: { callId, userId, isAudioEnabled: true },
                update: { leftAt: null },
            });
            // Relay answer to all call room participants (not just initiator)
            socket.to(`call:${callId}`).emit('call:answer', { callId, sdp, from: userId });
        }
        catch (err) {
            logger.error({ err, userId, callId }, 'call:answer error');
        }
    });
    // -------------------------------------------------------------------------
    // call:ice-candidate — Relay ICE candidates to all other call participants
    // -------------------------------------------------------------------------
    socket.on('call:ice-candidate', ({ callId, candidate }) => {
        // Broadcast to ALL other participants in the call room
        socket.to(`call:${callId}`).emit('call:ice-candidate', {
            callId,
            candidate,
            from: userId,
        });
    });
    // -------------------------------------------------------------------------
    // call:end — End the call for everyone
    // -------------------------------------------------------------------------
    socket.on('call:end', async ({ callId }) => {
        try {
            await prisma.call.update({
                where: { id: callId },
                data: { status: 'ENDED', endedAt: new Date() },
            });
            await prisma.callParticipant.updateMany({
                where: { callId, leftAt: null },
                data: { leftAt: new Date() },
            });
            io.to(`call:${callId}`).emit('call:ended', { callId, reason: 'ended' });
            io.in(`call:${callId}`).socketsLeave(`call:${callId}`);
        }
        catch (err) {
            logger.error({ err, userId, callId }, 'call:end error');
        }
    });
    // -------------------------------------------------------------------------
    // call:reject — Reject an incoming call
    // -------------------------------------------------------------------------
    socket.on('call:reject', async ({ callId }) => {
        try {
            const call = await prisma.call.findUnique({
                where: { id: callId },
                select: { initiatorId: true, status: true },
            });
            if (!call || call.status !== 'PENDING')
                return;
            await prisma.call.update({
                where: { id: callId },
                data: { status: 'REJECTED', endedAt: new Date() },
            });
            // Notify the call initiator
            io.to(`user:${call.initiatorId}`).emit('call:ended', {
                callId,
                reason: 'rejected',
            });
        }
        catch (err) {
            logger.error({ err, userId, callId }, 'call:reject error');
        }
    });
}
//# sourceMappingURL=call.handler.js.map