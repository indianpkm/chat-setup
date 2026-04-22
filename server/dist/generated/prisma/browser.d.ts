import * as Prisma from './internal/prismaNamespaceBrowser.js';
export { Prisma };
export * as $Enums from './enums.js';
export * from './enums.js';
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model RefreshToken
 *
 */
export type RefreshToken = Prisma.RefreshTokenModel;
/**
 * Model Conversation
 *
 */
export type Conversation = Prisma.ConversationModel;
/**
 * Model ConversationParticipant
 *
 */
export type ConversationParticipant = Prisma.ConversationParticipantModel;
/**
 * Model Message
 *
 */
export type Message = Prisma.MessageModel;
/**
 * Model MessageRead
 * Tracks which users have read which messages — powers read receipts
 */
export type MessageRead = Prisma.MessageReadModel;
/**
 * Model Media
 *
 */
export type Media = Prisma.MediaModel;
/**
 * Model Call
 *
 */
export type Call = Prisma.CallModel;
/**
 * Model CallParticipant
 *
 */
export type CallParticipant = Prisma.CallParticipantModel;
