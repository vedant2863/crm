import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { sanitizeString, validateObjectId } from "@/lib/validation";
import {
  createComment,
  getComments,
} from "@/features/enterprise/services/enterprise-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get("entityId");
    if (!entityId) {
      throw AppError.validationFailed("entityId query parameter is required");
    }
    validateObjectId(entityId, "entityId");

    const comments = await getComments(entityId);
    return NextResponse.json({ comments });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const body = await req.json();
    const { entityId, entityType, content } = body;
    if (!entityId || !entityType || !content) {
      throw AppError.validationFailed("entityId, entityType, and content are required");
    }
    validateObjectId(entityId, "entityId");
    const sanitizedContent = sanitizeString(content, 2000);
    if (!sanitizedContent) {
      throw AppError.validationFailed("Comment content cannot be empty");
    }

    const comment = await createComment(
      session.user.id,
      session.user.name || "User",
      sanitizedContent,
      entityType,
      entityId
    );

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
