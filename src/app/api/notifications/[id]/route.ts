import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { validateObjectId } from "@/lib/validation";
import { markAsRead } from "@/features/notifications/services/notification-service";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    const notification = await markAsRead(id, session.user.id);
    return NextResponse.json({ notification });
  } catch (err) {
    return handleApiError(err);
  }
}
