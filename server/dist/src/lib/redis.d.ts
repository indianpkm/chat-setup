/**
 * Redis Client Singleton
 *
 * Manages three separate ioredis connections:
 *   - main:  General purpose (caching, presence, rate limiting)
 *   - pub:   Socket.IO Redis adapter publisher
 *   - sub:   Socket.IO Redis adapter subscriber
 *
 * Socket.IO Redis adapter requires separate pub/sub clients because
 * a subscribed ioredis connection cannot execute regular commands.
 *
 * BullMQ jobs create their own connections internally via the factory.
 */
import { Redis } from 'ioredis';
export declare function getRedisClient(): Redis;
export declare function getRedisPub(): Redis;
export declare function getRedisSub(): Redis;
/** Create a dedicated Redis connection for BullMQ queues/workers */
export declare function createBullMQConnection(): Redis;
export declare function connectRedis(): Promise<void>;
export declare function disconnectRedis(): Promise<void>;
