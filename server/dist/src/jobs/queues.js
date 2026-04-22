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
import { Queue, Worker } from 'bullmq';
import { createBullMQConnection } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
// ---------------------------------------------------------------------------
// Queue names
// ---------------------------------------------------------------------------
export const QUEUE_NAMES = {
    MEDIA_PROCESSING: 'media-processing',
    PUSH_NOTIFICATIONS: 'push-notifications',
};
// ---------------------------------------------------------------------------
// Queue instances
// ---------------------------------------------------------------------------
// Each queue gets its own connection (BullMQ requirement)
export const mediaQueue = new Queue(QUEUE_NAMES.MEDIA_PROCESSING, {
    connection: createBullMQConnection(),
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
    },
});
export const notificationQueue = new Queue(QUEUE_NAMES.PUSH_NOTIFICATIONS, {
    connection: createBullMQConnection(),
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 100 },
    },
});
// ---------------------------------------------------------------------------
// Workers
// ---------------------------------------------------------------------------
let mediaWorker = null;
let notificationWorker = null;
// ---------------------------------------------------------------------------
// Media processor
// ---------------------------------------------------------------------------
async function processMediaJob(job) {
    const { filename, mimeType, size, uploadedBy } = job.data;
    logger.info({ jobId: job.id, filename, mimeType, size, uploadedBy }, 'Processing media upload');
    await job.updateProgress(10);
    if (mimeType.startsWith('image/')) {
        // TODO: Use `sharp` to resize, generate WebP thumbnail, extract dimensions
        // Example:
        //   const sharp = await import('sharp');
        //   await sharp.default(inputPath).resize(800).webp().toFile(thumbPath);
        logger.info({ filename }, 'Image processing placeholder — integrate sharp');
        await job.updateProgress(80);
    }
    else if (mimeType.startsWith('video/')) {
        // TODO: Use `fluent-ffmpeg` to generate thumbnail + extract duration
        logger.info({ filename }, 'Video processing placeholder — integrate ffmpeg');
        await job.updateProgress(80);
    }
    else if (mimeType.startsWith('audio/')) {
        // TODO: Extract duration with ffprobe
        logger.info({ filename }, 'Audio processing placeholder — integrate ffprobe');
        await job.updateProgress(80);
    }
    await job.updateProgress(100);
    return { success: true };
}
// ---------------------------------------------------------------------------
// Notification processor
// ---------------------------------------------------------------------------
async function processNotificationJob(job) {
    const { messageId, conversationId, senderId, recipientIds } = job.data;
    logger.info({ jobId: job.id, messageId, conversationId, recipientCount: recipientIds.length }, 'Processing push notifications');
    // TODO: Integrate real push notification provider:
    //   - Firebase Cloud Messaging (FCM) for Android & web
    //   - Apple Push Notification service (APNs) for iOS
    //   Example:
    //     const message = { notification: { title: '...', body: '...' }, tokens: fcmTokens };
    //     await admin.messaging().sendEachForMulticast(message);
    logger.info({ recipientIds, senderId }, 'Push notification placeholder — integrate FCM/APNs');
    // In production: fetch device tokens from DB, call push provider
    // await sendFCMNotification(recipientIds, { messageId, conversationId, senderId });
    return { notified: recipientIds.length };
}
// ---------------------------------------------------------------------------
// Lifecycle management
// ---------------------------------------------------------------------------
export async function startWorkers() {
    mediaWorker = new Worker(QUEUE_NAMES.MEDIA_PROCESSING, processMediaJob, {
        connection: createBullMQConnection(),
        concurrency: 5,
    });
    notificationWorker = new Worker(QUEUE_NAMES.PUSH_NOTIFICATIONS, processNotificationJob, {
        connection: createBullMQConnection(),
        concurrency: 10,
    });
    // Attach logging to both workers
    for (const worker of [mediaWorker, notificationWorker]) {
        worker.on('completed', (job) => {
            logger.info({ jobId: job.id, queue: job.queueName, duration: Date.now() - job.timestamp }, 'Job completed');
        });
        worker.on('failed', (job, err) => {
            logger.error({ jobId: job?.id, queue: job?.queueName, err, attemptsMade: job?.attemptsMade }, 'Job failed');
        });
        worker.on('stalled', (jobId) => {
            logger.warn({ jobId, queue: worker.name }, 'Job stalled');
        });
        worker.on('error', (err) => {
            logger.error({ err, queue: worker.name }, 'Worker error');
        });
    }
    logger.info('BullMQ workers started');
}
export async function stopWorkers() {
    await Promise.all([
        mediaWorker?.close(),
        notificationWorker?.close(),
    ]);
    logger.info('BullMQ workers stopped');
}
//# sourceMappingURL=queues.js.map