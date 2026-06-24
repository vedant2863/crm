import {
  handleGetNotifications,
  handleMarkAllAsRead,
} from "@/features/notifications/api/handler";

export async function GET() {
  return handleGetNotifications();
}

export async function PUT() {
  return handleMarkAllAsRead();
}
