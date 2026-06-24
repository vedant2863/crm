import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import {
  createComment,
  getComments,
} from "@/features/enterprise/services/enterprise-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get("entityId");
    if (!entityId) {
      return NextResponse.json(
        { error: "entityId query parameter is required" },
        { status: 400 }
      );
    }
    const comments = await getComments(entityId);
    return NextResponse.json({ comments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { entityId, entityType, content } = body;
    if (!entityId || !entityType || !content) {
      return NextResponse.json(
        { error: "entityId, entityType, and content are required" },
        { status: 400 }
      );
    }

    const comment = await createComment(
      session.user.id,
      session.user.name || "User",
      content,
      entityType,
      entityId
    );

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error("Error creating comment:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
