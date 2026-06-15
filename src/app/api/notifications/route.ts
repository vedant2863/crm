import { NextRequest } from "next/server";
import {
  handleGetNotifications,
  handleMarkAllAsRead,
} from "@/features/notifications/api/handler";

export async function GET(req: NextRequest) {
  return handleGetNotifications(req);
}

export async function PUT(req: NextRequest) {
  return handleMarkAllAsRead(req);
}
