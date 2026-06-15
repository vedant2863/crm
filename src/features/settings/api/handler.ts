/**
 * features/settings/api/handler.ts
 *
 * HTTP Translation Layer for settings.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUserSettings, updateUserSettings, changePassword } from "../services/settings-service";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

function handleError(err: unknown) {
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "NOT_FOUND") return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (err.message === "INVALID_PASSWORD") return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function handleGetSettings() {
  try {
    const userId = await requireAuth();
    const user = await getUserSettings(userId);
    return NextResponse.json({ user });
  } catch (err) { return handleError(err); }
}

export async function handleUpdateSettings(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const user = await updateUserSettings(userId, body);
    return NextResponse.json({ user });
  } catch (err) { return handleError(err); }
}

export async function handleSettingsAction(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { action, currentPassword, newPassword } = await req.json();

    if (action === "change-password") {
      if (!currentPassword || !newPassword)
        return NextResponse.json({ error: "Current and new password required" }, { status: 400 });
      await changePassword(userId, currentPassword, newPassword);
      return NextResponse.json({ message: "Password updated successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) { return handleError(err); }
}
