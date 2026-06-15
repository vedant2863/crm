/**
 * features/notifications/api/handler.ts
 *
 * HTTP Translation Layer for notifications.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notification-service";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

function handleError(err: unknown) {
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function handleGetNotifications(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const notifications = await getNotifications(userId);
    return NextResponse.json({ notifications });
  } catch (err) {
    return handleError(err);
  }
}

export async function handleMarkAllAsRead(req: NextRequest) {
  try {
    const userId = await requireAuth();
    await markAllAsRead(userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}

export async function handleMarkAsRead(
  req: NextRequest,
  id: string
) {
  try {
    const userId = await requireAuth();
    const notification = await markAsRead(id, userId);
    return NextResponse.json({ notification });
  } catch (err) {
    return handleError(err);
  }
}
