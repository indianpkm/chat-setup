/**
 * Conversations Controller
 */

import type { Request, Response, NextFunction } from 'express';
import * as service from './conversations.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';

export async function listConversations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const conversations = await service.getUserConversations(req.user!.id);
    sendSuccess(res, conversations);
  } catch (err) {
    next(err);
  }
}

export async function createDM(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { conversation, created } = await service.getOrCreateDM(
      req.user!.id,
      req.body.recipientId,
    );
    created
      ? sendCreated(res, conversation, 'Conversation created')
      : sendSuccess(res, conversation, 'Existing conversation returned');
  } catch (err) {
    next(err);
  }
}

export async function createGroup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const group = await service.createGroup(req.user!.id, req.body);
    sendCreated(res, group, 'Group created');
  } catch (err) {
    next(err);
  }
}

export async function getConversation(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const conv = await service.getConversationById(
      req.params.id,
      req.user!.id,
    );
    sendSuccess(res, conv);
  } catch (err) {
    next(err);
  }
}

export async function updateGroup(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const conv = await service.updateGroup(
      req.params.id,
      req.user!.id,
      req.body,
    );
    sendSuccess(res, conv, 'Group updated');
  } catch (err) {
    next(err);
  }
}

export async function addParticipants(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await service.addParticipants(
      req.params.id,
      req.user!.id,
      req.body.userIds,
    );
    sendSuccess(res, null, 'Participants added');
  } catch (err) {
    next(err);
  }
}

export async function removeParticipant(
  req: Request<{ id: string; userId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await service.removeParticipant(
      req.params.id,
      req.user!.id,
      req.params.userId,
    );
    sendSuccess(res, null, 'Participant removed');
  } catch (err) {
    next(err);
  }
}

export async function leaveConversation(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await service.leaveConversation(req.params.id, req.user!.id);
    sendSuccess(res, null, 'Left conversation');
  } catch (err) {
    next(err);
  }
}
