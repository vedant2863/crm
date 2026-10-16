"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

/**
 * Get or create the shared Socket.io client instance.
 */
export function getSocketClient(): Socket {
  if (typeof window === "undefined") {
    // Return a dummy object for SSR if invoked during rendering
    return {} as Socket;
  }

  if (!socketInstance) {
    socketInstance = io({
      path: "/api/socket/io",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
    });
  }

  return socketInstance;
}
