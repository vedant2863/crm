import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { getNotifications, markAllAsRead } from "@/features/notifications/services/notification-service";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const notifications = await getNotifications(session.user.id);
    return NextResponse.json({ notifications });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    await markAllAsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
