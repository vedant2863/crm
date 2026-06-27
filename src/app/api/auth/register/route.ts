import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  const normalizedEmail = email.toLowerCase();

  await dbConnect();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
