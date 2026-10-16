"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  ClientNotification,
} from "../services/notification-client-service";
import toast from "react-hot-toast";
import { getSocketClient } from "@/lib/socket/socket-client";
import { useSession } from "@/lib/auth/auth-client";

export function useNotifications() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load and backup polling
  useEffect(() => {
    loadNotifications();

    // Fallback sync every 60 seconds
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Real-time Socket.IO notification synchronization
  useEffect(() => {
    if (typeof window === "undefined" || status !== "authenticated") return;

    const socket = getSocketClient();

    const joinRoom = () => {
      if (session?.user?.id) {
        socket.emit("join:pipeline", {
          userId: session.user.id,
          company: (session.user as { company?: string })?.company,
        });
      }
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    const handleNewNotification = (newNotif: ClientNotification) => {
      setNotifications((prev) => [
        newNotif,
        ...prev.filter((n) => n._id !== newNotif._id),
      ]);

      toast(`🔔 ${newNotif.title}: ${newNotif.message}`, {
        duration: 4500,
        position: "top-right",
      });
    };

    socket.on("notification:created", handleNewNotification);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("notification:created", handleNewNotification);
    };
  }, [session, status]);

  const markRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      await markNotificationAsRead(id);
    } catch {
      toast.error("Failed to mark notification as read");
      // Revert on failure
      loadNotifications(true);
    }
  };

  const markAllRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await markAllNotificationsAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
      loadNotifications(true);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markRead,
    markAllRead,
    refresh: () => loadNotifications(false),
  };
}

