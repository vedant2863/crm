/**
 * @file src/lib/socket/server.ts
 * @description Server-side Socket.io initialization, room management, and event broadcasting.
 */

import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

// Global declaration to maintain single instance across hot reloads in development
declare global {
  var _io: SocketIOServer | undefined;
}

/**
 * Initialize the Socket.io server instance on top of an HTTP server.
 */
export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  if (global._io) {
    return global._io;
  }

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket/io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    addTrailingSlash: false,
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  io.on("connection", (socket: Socket) => {
    // Handle client joining their user / organization room
    socket.on("join:pipeline", (data: { userId?: string; company?: string }) => {
      if (data?.userId) {
        socket.join(`user:${data.userId}`);
      }
      if (data?.company) {
        socket.join(`company:${data.company}`);
      }
    });

    // Leave rooms on disconnect
    socket.on("disconnect", () => {
      // Socket.io automatically cleans up rooms on disconnect
    });
  });

  global._io = io;
  return io;
}

/**
 * Retrieve the current Socket.io server instance.
 */
export function getSocketServer(): SocketIOServer | null {
  return global._io || null;
}

/**
 * Broadcast an event to a target set of user IDs.
 */
export function emitToUsers(
  userIds: string[],
  event: string,
  payload: Record<string, unknown>
): void {
  const io = getSocketServer();
  if (!io) return;

  userIds.forEach((uid) => {
    io.to(`user:${uid}`).emit(event, payload);
  });
}

/**
 * Broadcast deal events to a target set of user IDs.
 */
export function emitDealToUsers(
  userIds: string[],
  event: "deal:created" | "deal:updated" | "deal:deleted",
  payload: Record<string, unknown>
): void {
  emitToUsers(userIds, event, payload);
}

/**
 * Broadcast a notification directly to a recipient user.
 */
export function emitNotificationToUser(
  userId: string,
  notification: Record<string, unknown>
): void {
  const io = getSocketServer();
  if (!io) return;
  io.to(`user:${userId}`).emit("notification:created", notification);
}

/**
 * Broadcast task events to a target set of organization user IDs.
 */
export function emitTaskToUsers(
  userIds: string[],
  event: "task:created" | "task:updated" | "task:deleted",
  payload: Record<string, unknown>
): void {
  emitToUsers(userIds, event, payload);
}

/**
 * Broadcast contact events to a target set of organization user IDs.
 */
export function emitContactToUsers(
  userIds: string[],
  event: "contact:created" | "contact:updated" | "contact:deleted",
  payload: Record<string, unknown>
): void {
  emitToUsers(userIds, event, payload);
}
