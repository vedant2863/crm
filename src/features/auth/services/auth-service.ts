/**
 * features/auth/services/auth-service.ts
 *
 * Pure DB layer for authentication.
 * No Next.js imports — fully framework-independent.
 */
import bcrypt from "bcryptjs";
import User from "@/models/user";
import dbConnect from "@/lib/dbConnect";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Create a new user account.
 * Throws if the email is already registered.
 */
export async function createUser(payload: CreateUserPayload): Promise<UserPublic> {
  await dbConnect();
  const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
  if (existingUser) {
    throw new Error("EMAIL_TAKEN");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: hashedPassword,
    role: "user",
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role || "user",
  };
}
