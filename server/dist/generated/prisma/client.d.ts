import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class.js";
import * as Prisma from "./internal/prismaNamespace.js";
export * as $Enums from './enums.js';
export * from "./enums.js";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
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
