/**
 * Socket.IO Type Definitions
 *
 * Fully typed Client↔Server event contracts.
 * TypedServer and TypedSocket are used throughout socket handlers
 * to guarantee type safety on all emits and listeners.
 */

import type { Server, Socket } from 'socket.io';

// ---------------------------------------------------------------------------
// Payload Types
// ---------------------------------------------------------------------------

export interface SendMessagePayload {
  conversationId: string;
  encryptedContent: string; // Base64 ciphertext (XSalsa20-Poly1305)
  nonce: string; // Base64 nonce
  contentType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  mediaUrl?: string;
  replyToId?: string;
}

export interface MessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  encryptedContent: string;
  nonce: string;
  contentType: string;
  mediaUrl: string | null;
  replyToId: string | null;
  isEdited: boolean;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

export interface InitiateCallPayload {
  conversationId: string;
  callType: 'AUDIO' | 'VIDEO';
}

export interface IncomingCallPayload {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string | null;
  callType: 'AUDIO' | 'VIDEO';
  conversationId: string;
}

export interface AckResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---------------------------------------------------------------------------
// Socket.IO Event Maps
// ---------------------------------------------------------------------------

/** Events emitted by the client, received by the server */
export interface ClientToServerEvents {
  /** Send an encrypted message to a conversation */
  'msg:send': (
    payload: SendMessagePayload,
    ack: (res: AckResponse<{ messageId: string }>) => void,
  ) => void;

  /** Mark a specific message as read */
  'msg:read': (payload: { messageId: string; conversationId: string }) => void;

  /** Delete own message (soft-delete, content wiped) */
  'msg:delete': (payload: { messageId: string }) => void;

  /** User started typing in a conversation */
  'typing:start': (payload: { conversationId: string }) => void;

  /** User stopped typing in a conversation */
  'typing:stop': (payload: { conversationId: string }) => void;

  /** Initiate a new audio/video call */
  'call:initiate': (
    payload: InitiateCallPayload,
    ack: (res: AckResponse<{ callId: string }>) => void,
  ) => void;

  /** WebRTC: send SDP offer to a specific peer */
  'call:offer': (payload: {
    callId: string;
    targetUserId: string;
    sdp: RTCSessionDescriptionInit;
  }) => void;

  /** WebRTC: send SDP answer back to call initiator */
  'call:answer': (payload: {
    callId: string;
    sdp: RTCSessionDescriptionInit;
  }) => void;

  /** WebRTC: relay ICE candidate to all other call participants */
  'call:ice-candidate': (payload: {
    callId: string;
    candidate: RTCIceCandidateInit;
  }) => void;

  /** End an active call */
  'call:end': (payload: { callId: string }) => void;

  /** Reject an incoming call */
  'call:reject': (payload: { callId: string }) => void;

  /** Heartbeat to keep user presence TTL alive in Redis */
  'presence:ping': () => void;
}

/** Events emitted by the server, received by the client */
export interface ServerToClientEvents {
  /** A new message arrived in a conversation */
  'msg:new': (message: MessagePayload) => void;

  /** A message was edited */
  'msg:updated': (message: Partial<MessagePayload> & { id: string }) => void;

  /** A message was deleted */
  'msg:deleted': (payload: {
    messageId: string;
    conversationId: string;
  }) => void;

  /** Read receipt for a specific message */
  'msg:read-receipt': (payload: {
    messageId: string;
    userId: string;
    readAt: Date;
  }) => void;

  /** Typing indicator update for a conversation */
  'typing:update': (payload: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void;

  /** Incoming call notification */
  'call:incoming': (payload: IncomingCallPayload) => void;

  /** WebRTC SDP offer relayed from another peer */
  'call:offer': (payload: {
    callId: string;
    sdp: RTCSessionDescriptionInit;
    from: string;
  }) => void;

  /** WebRTC SDP answer relayed from another peer */
  'call:answer': (payload: {
    callId: string;
    sdp: RTCSessionDescriptionInit;
    from: string;
  }) => void;

  /** WebRTC ICE candidate relayed from another peer */
  'call:ice-candidate': (payload: {
    callId: string;
    candidate: RTCIceCandidateInit;
    from: string;
  }) => void;

  /** A call was ended or rejected */
  'call:ended': (payload: {
    callId: string;
    reason: 'ended' | 'rejected' | 'missed' | 'error';
  }) => void;

  /** User presence status changed */
  'presence:update': (payload: {
    userId: string;
    status: 'ONLINE' | 'OFFLINE' | 'AWAY';
    lastSeen: Date | null;
  }) => void;

  /** Server-side error notification */
  error: (payload: { message: string; code: string }) => void;
}

/** Per-connection socket metadata */
export interface SocketData {
  userId: string;
  email: string;
}

/** Fully typed Socket.IO server instance */
export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

/** Fully typed individual socket connection */
export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
