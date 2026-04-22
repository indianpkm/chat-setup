/**
 * Conversations Controller
 */
import * as service from './conversations.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
export async function listConversations(req, res, next) {
    try {
        const conversations = await service.getUserConversations(req.user.id);
        sendSuccess(res, conversations);
    }
    catch (err) {
        next(err);
    }
}
export async function createDM(req, res, next) {
    try {
        const { conversation, created } = await service.getOrCreateDM(req.user.id, req.body.recipientId);
        created
            ? sendCreated(res, conversation, 'Conversation created')
            : sendSuccess(res, conversation, 'Existing conversation returned');
    }
    catch (err) {
        next(err);
    }
}
export async function createGroup(req, res, next) {
    try {
        const group = await service.createGroup(req.user.id, req.body);
        sendCreated(res, group, 'Group created');
    }
    catch (err) {
        next(err);
    }
}
export async function getConversation(req, res, next) {
    try {
        const conv = await service.getConversationById(req.params.id, req.user.id);
        sendSuccess(res, conv);
    }
    catch (err) {
        next(err);
    }
}
export async function updateGroup(req, res, next) {
    try {
        const conv = await service.updateGroup(req.params.id, req.user.id, req.body);
        sendSuccess(res, conv, 'Group updated');
    }
    catch (err) {
        next(err);
    }
}
export async function addParticipants(req, res, next) {
    try {
        await service.addParticipants(req.params.id, req.user.id, req.body.userIds);
        sendSuccess(res, null, 'Participants added');
    }
    catch (err) {
        next(err);
    }
}
export async function removeParticipant(req, res, next) {
    try {
        await service.removeParticipant(req.params.id, req.user.id, req.params.userId);
        sendSuccess(res, null, 'Participant removed');
    }
    catch (err) {
        next(err);
    }
}
export async function leaveConversation(req, res, next) {
    try {
        await service.leaveConversation(req.params.id, req.user.id);
        sendSuccess(res, null, 'Left conversation');
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=conversations.controller.js.map