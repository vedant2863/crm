import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in GET settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      position,
      timezone,
      language,
      notifications
    } = body;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name,
        email,
        phone,
        company,
        position,
        timezone,
        language,
        notifications
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error in PUT settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, currentPassword, newPassword } = body;

    if (action === "change-password") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Current password and new password are required" },
          { status: 400 }
        );
      }

      await dbConnect();

      const user = await User.findById(session.user.id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await User.findByIdAndUpdate(session.user.id, {
        password: hashedNewPassword
      });

      return NextResponse.json({ message: "Password updated successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in POST settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
