export declare const UserStatus: {
    readonly ONLINE: "ONLINE";
    readonly OFFLINE: "OFFLINE";
    readonly AWAY: "AWAY";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const ConversationType: {
    readonly DIRECT: "DIRECT";
    readonly GROUP: "GROUP";
};
export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType];
export declare const ContentType: {
    readonly TEXT: "TEXT";
    readonly IMAGE: "IMAGE";
    readonly VIDEO: "VIDEO";
    readonly AUDIO: "AUDIO";
    readonly FILE: "FILE";
    readonly SYSTEM: "SYSTEM";
};
export type ContentType = (typeof ContentType)[keyof typeof ContentType];
export declare const CallType: {
    readonly AUDIO: "AUDIO";
    readonly VIDEO: "VIDEO";
};
export type CallType = (typeof CallType)[keyof typeof CallType];
export declare const CallStatus: {
    readonly PENDING: "PENDING";
    readonly ACTIVE: "ACTIVE";
    readonly ENDED: "ENDED";
    readonly MISSED: "MISSED";
    readonly REJECTED: "REJECTED";
};
export type CallStatus = (typeof CallStatus)[keyof typeof CallStatus];
export declare const ParticipantRole: {
    readonly MEMBER: "MEMBER";
    readonly ADMIN: "ADMIN";
    readonly OWNER: "OWNER";
};
export type ParticipantRole = (typeof ParticipantRole)[keyof typeof ParticipantRole];
