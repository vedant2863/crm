/**
 * features/notifications/services/notification-client-service.ts
 *
 * Client-side HTTP wrappers for notifications APIs.
 */

export interface ClientNotification {
  _id: string;
  title: string;
  message: string;
  type: "lead" | "task" | "deal" | "general";
  read: boolean;
  referenceId?: string;
  referenceType?: "contact" | "task" | "deal";
  createdAt: string;
  updatedAt: string;
}

/** Get recent notifications for the logged-in user */
export async function fetchNotifications(): Promise<ClientNotification[]> {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const data = await res.json();
  return data.notifications || [];
}

/** Mark a single notification as read */
export async function markNotificationAsRead(id: string): Promise<ClientNotification> {
  const res = await fetch(`/api/notifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to update notification");
  const data = await res.json();
  return data.notification;
}

/** Mark all notifications as read */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  const res = await fetch("/api/notifications", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to update all notifications");
  const data = await res.json();
  return !!data.success;
}
