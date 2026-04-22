import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly RefreshToken: "RefreshToken";
    readonly Conversation: "Conversation";
    readonly ConversationParticipant: "ConversationParticipant";
    readonly Message: "Message";
    readonly MessageRead: "MessageRead";
    readonly Media: "Media";
    readonly Call: "Call";
    readonly CallParticipant: "CallParticipant";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly username: "username";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly publicKey: "publicKey";
    readonly avatar: "avatar";
    readonly bio: "bio";
    readonly status: "status";
    readonly lastSeen: "lastSeen";
    readonly isVerified: "isVerified";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const RefreshTokenScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly tokenHash: "tokenHash";
    readonly expiresAt: "expiresAt";
    readonly revoked: "revoked";
    readonly createdAt: "createdAt";
};
export type RefreshTokenScalarFieldEnum = (typeof RefreshTokenScalarFieldEnum)[keyof typeof RefreshTokenScalarFieldEnum];
export declare const ConversationScalarFieldEnum: {
    readonly id: "id";
    readonly type: "type";
    readonly name: "name";
    readonly avatar: "avatar";
    readonly description: "description";
    readonly lastMessageAt: "lastMessageAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ConversationScalarFieldEnum = (typeof ConversationScalarFieldEnum)[keyof typeof ConversationScalarFieldEnum];
export declare const ConversationParticipantScalarFieldEnum: {
    readonly conversationId: "conversationId";
    readonly userId: "userId";
    readonly role: "role";
    readonly mutedUntil: "mutedUntil";
    readonly joinedAt: "joinedAt";
    readonly leftAt: "leftAt";
};
export type ConversationParticipantScalarFieldEnum = (typeof ConversationParticipantScalarFieldEnum)[keyof typeof ConversationParticipantScalarFieldEnum];
export declare const MessageScalarFieldEnum: {
    readonly id: "id";
    readonly conversationId: "conversationId";
    readonly senderId: "senderId";
    readonly encryptedContent: "encryptedContent";
    readonly nonce: "nonce";
    readonly contentType: "contentType";
    readonly mediaUrl: "mediaUrl";
    readonly replyToId: "replyToId";
    readonly isEdited: "isEdited";
    readonly deletedAt: "deletedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum];
export declare const MessageReadScalarFieldEnum: {
    readonly messageId: "messageId";
    readonly userId: "userId";
    readonly readAt: "readAt";
};
export type MessageReadScalarFieldEnum = (typeof MessageReadScalarFieldEnum)[keyof typeof MessageReadScalarFieldEnum];
export declare const MediaScalarFieldEnum: {
    readonly id: "id";
    readonly messageId: "messageId";
    readonly url: "url";
    readonly mimeType: "mimeType";
    readonly size: "size";
    readonly width: "width";
    readonly height: "height";
    readonly duration: "duration";
    readonly createdAt: "createdAt";
};
export type MediaScalarFieldEnum = (typeof MediaScalarFieldEnum)[keyof typeof MediaScalarFieldEnum];
export declare const CallScalarFieldEnum: {
    readonly id: "id";
    readonly conversationId: "conversationId";
    readonly callType: "callType";
    readonly status: "status";
    readonly initiatorId: "initiatorId";
    readonly startedAt: "startedAt";
    readonly endedAt: "endedAt";
};
export type CallScalarFieldEnum = (typeof CallScalarFieldEnum)[keyof typeof CallScalarFieldEnum];
export declare const CallParticipantScalarFieldEnum: {
    readonly callId: "callId";
    readonly userId: "userId";
    readonly joinedAt: "joinedAt";
    readonly leftAt: "leftAt";
    readonly isVideoEnabled: "isVideoEnabled";
    readonly isAudioEnabled: "isAudioEnabled";
};
export type CallParticipantScalarFieldEnum = (typeof CallParticipantScalarFieldEnum)[keyof typeof CallParticipantScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
