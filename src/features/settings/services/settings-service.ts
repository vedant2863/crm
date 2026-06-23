/**
 * features/settings/services/settings-service.ts
 *
 * Pure DB layer for user settings and profile.
 * No Next.js imports — fully framework-independent.
 */
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  timezone?: string;
  language?: string;
  notifications?: Record<string, boolean>;
  security?: {
    twoFactorAuth?: boolean;
    sessionTimeout?: number;
    loginHistory?: boolean;
  };
}

/** Fetch user settings (no password) */
export async function getUserSettings(userId: string) {
  await dbConnect();
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("NOT_FOUND");
  return user;
}

/** Update user profile settings */
export async function updateUserSettings(userId: string, data: ProfileUpdatePayload) {
  await dbConnect();

  const updated = await User.findByIdAndUpdate(
    userId,
    { ...data },
    { new: true, select: "-password" }
  );

  if (!updated) throw new Error("NOT_FOUND");
  return updated;
}

/** Change user password */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  await dbConnect();

  const user = await User.findById(userId);
  if (!user) throw new Error("NOT_FOUND");

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new Error("INVALID_PASSWORD");

  const hashed = await bcrypt.hash(newPassword, 12);
  await User.findByIdAndUpdate(userId, { password: hashed });
}
