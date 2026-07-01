import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { getUserSettings, updateUserSettings, changePassword } from "@/features/settings/services/settings-service";
import { invalidateOrgCache } from "@/lib/org-cache";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const user = await getUserSettings(session.user.id);
    return NextResponse.json({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const body = await req.json();
    const user = await updateUserSettings(session.user.id, body);

    // Invalidate org cache when user settings change (company or sharing toggle may have changed)
    invalidateOrgCache(session.user.id);

    return NextResponse.json({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { action, currentPassword, newPassword } = await req.json();

    if (action === "change-password") {
      if (!currentPassword || !newPassword) {
        throw AppError.validationFailed("Current and new password required");
      }
      await changePassword(session.user.id, currentPassword, newPassword);
      return NextResponse.json({ message: "Password updated successfully" });
    }

    throw AppError.validationFailed("Invalid action");
  } catch (err) {
    return handleApiError(err);
  }
}
