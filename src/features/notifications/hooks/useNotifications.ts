"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  ClientNotification,
} from "../services/notification-client-service";
import toast from "react-hot-toast";

export function useNotifications() {
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

  // Poll notifications in background every 30 seconds
  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      await markNotificationAsRead(id);
    } catch (error) {
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
    } catch (error) {
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
export default useNotifications;
