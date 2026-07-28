/**
 * Socket.IO Server Initialization
 *
 * Sets up the Socket.IO server with:
 *   - Redis adapter (enables horizontal scaling across multiple Node instances)
 *   - JWT authentication middleware
 *   - All event handlers registered per connection
 *   - Structured logging for connect/disconnect events
 *
 * Must be called AFTER connectRedis() succeeds.
 */

import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import type { Server as HTTPServer } from "http";
import { getRedisPub, getRedisSub } from "../lib/redis.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { socketAuthMiddleware } from "./middleware/socketAuth.js";
import { checkSocketEventLimit } from "../middleware/rateLimiter.js";
import { registerPresenceHandlers } from "./handlers/presence.handler.js";
import { registerMessageHandlers } from "./handlers/message.handler.js";
import { registerTypingHandlers } from "./handlers/typing.handler.js";
import { registerCallHandlers } from "./handlers/call.handler.js";
import { registerConversationHandlers } from "./handlers/conversation.handler.js";
import type { TypedServer, TypedSocket } from "../types/socket.js";

let io: TypedServer | null = null;

export function initSocketServer(httpServer: HTTPServer): TypedServer {
  const allowedOrigins = env.CORS_ORIGINS.split(",").map((o) => o.trim());

  io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    // Prefer WebSocket; fall back to polling for restrictive firewalls
    transports: ["websocket", "polling"],
    // Keep-alive configuration
    pingTimeout: 60_000,
    pingInterval: 25_000,
    // Max payload per message (10 MB)
    maxHttpBufferSize: 10 * 1024 * 1024,
    // Connection state recovery — allows clients to reconnect without missing events
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: false,
    },
  }) as TypedServer;

  // Attach Redis adapter for pub/sub across multiple server instances
  const pubClient = getRedisPub();
  const subClient = getRedisSub();
  io.adapter(createAdapter(pubClient, subClient));
  logger.info("Socket.IO Redis adapter initialized");

  // JWT auth middleware — runs before any connection is established
  io.use(socketAuthMiddleware);

  // Connection lifecycle
  io.on("connection", (socket: TypedSocket) => {
    const { userId } = socket.data;

    // Per-user event throttling
    socket.use(async ([event, ..._args], next) => {
      // Internal events don't count
      if (event === "disconnect" || event === "error") return next();

      const allowed = await checkSocketEventLimit(userId);
      if (!allowed) {
        logger.warn({ userId, event }, "Socket event rate limit exceeded");
        return next(new Error("Rate limit exceeded. Please slow down."));
      }
      next();
    });

    logger.info(
      { userId, socketId: socket.id, transport: socket.conn.transport.name },
      "Socket connected",
    );

    // Join personal room — used for targeted events (call:incoming, etc.)
    socket.join(`user:${userId}`);

    // Register all feature handlers
    registerPresenceHandlers(io!, socket);
    registerConversationHandlers(io!, socket);
    registerMessageHandlers(io!, socket);
    registerTypingHandlers(io!, socket);
    registerCallHandlers(io!, socket);

    socket.on("disconnect", (reason) => {
      logger.info(
        { userId, socketId: socket.id, reason },
        "Socket disconnected",
      );
    });

    socket.on("error", (err) => {
      logger.error({ userId, socketId: socket.id, err }, "Socket error");
    });
  });

  // Monitor adapter events for debugging
  io.of("/").adapter.on("error", (err: Error) => {
    logger.error({ err }, "Socket.IO adapter error");
  });

  return io;
}

/** Get the initialized Socket.IO server instance */
export function getIO(): TypedServer {
  if (!io) throw new Error("Socket.IO server not initialized");
  return io;
}
