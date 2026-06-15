/**
 * features/auth/api/handler.ts
 *
 * HTTP Translation Layer for auth.
 * Reads request → calls service → returns NextResponse.
 */
import { NextRequest, NextResponse } from "next/server";
import { createUser } from "../services/auth-service";

export async function handleRegister(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await createUser({ name, email, password });
    return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
