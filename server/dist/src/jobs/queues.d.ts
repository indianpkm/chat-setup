/**
 * BullMQ Queue Definitions + Workers
 *
 * Queues:
 *   media-processing     — Resize images, generate thumbnails, extract metadata
 *   push-notifications   — Send FCM/APNs push to offline users
 *
 * Each queue and worker gets its OWN dedicated Redis connection.
 * BullMQ requires `maxRetriesPerRequest: null` on its ioredis connections — this
 * is NOT compatible with the shared app Redis clients, so we use a factory.
 *
 * Worker concurrency:
 *   media:         5  (CPU-bound — tune per server specs)
 *   notifications: 10 (I/O-bound — can handle more concurrency)
 */
import { Queue } from 'bullmq';
export declare const QUEUE_NAMES: {
    readonly MEDIA_PROCESSING: "media-processing";
    readonly PUSH_NOTIFICATIONS: "push-notifications";
};
export interface MediaJobData {
    filename: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
    messageId?: string;
}
export interface NotificationJobData {
    messageId: string;
    conversationId: string;
    senderId: string;
    recipientIds: string[];
}
export declare const mediaQueue: Queue<MediaJobData, any, string, MediaJobData, any, string>;
export declare const notificationQueue: Queue<NotificationJobData, any, string, NotificationJobData, any, string>;
export declare function startWorkers(): Promise<void>;
export declare function stopWorkers(): Promise<void>;
