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
import { env } from '../config/env.js';
import { logger } from './logger.js';

type RedisClientName = 'main' | 'pub' | 'sub' | 'bullmq';

function createRedisClient(name: RedisClientName): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: name === 'bullmq' ? null : 3,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times: number) => {
      if (times > 10) {
        logger.error({ name }, 'Redis max reconnection attempts reached');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000); // Exponential backoff up to 3s
    },
  });

  client.on('connect', () =>
    logger.info({ service: 'redis', name }, 'Redis client connected'),
  );
  client.on('ready', () =>
    logger.info({ service: 'redis', name }, 'Redis client ready'),
  );
  client.on('error', (err: Error) =>
    logger.error({ service: 'redis', name, err }, 'Redis client error'),
  );
  client.on('close', () =>
    logger.warn({ service: 'redis', name }, 'Redis connection closed'),
  );
  client.on('reconnecting', () =>
    logger.warn({ service: 'redis', name }, 'Redis reconnecting...'),
  );

  return client;
}

// Singleton clients
let mainClient: Redis | null = null;
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!mainClient) mainClient = createRedisClient('main');
  return mainClient;
}

export function getRedisPub(): Redis {
  if (!pubClient) pubClient = createRedisClient('pub');
  return pubClient;
}

export function getRedisSub(): Redis {
  if (!subClient) subClient = createRedisClient('sub');
  return subClient;
}

/** Create a dedicated Redis connection for BullMQ queues/workers */
export function createBullMQConnection(): Redis {
  return createRedisClient('bullmq');
}

export async function connectRedis(): Promise<void> {
  await Promise.all([
    getRedisClient().connect(),
    getRedisPub().connect(),
    getRedisSub().connect(),
  ]);
}

export async function disconnectRedis(): Promise<void> {
  await Promise.all([
    mainClient?.quit(),
    pubClient?.quit(),
    subClient?.quit(),
  ]);
  mainClient = null;
  pubClient = null;
  subClient = null;
}
