import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { validatePagination, sanitizeString } from "@/lib/validation";
import { getTasks, createTask } from "@/features/tasks/services/task-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { searchParams } = new URL(req.url);
    const { page, limit } = validatePagination({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });
    const search = sanitizeString(searchParams.get("search"), 200) || undefined;
    const status = sanitizeString(searchParams.get("status"), 50) || undefined;
    const priority = sanitizeString(searchParams.get("priority"), 50) || undefined;

    const result = await getTasks({ userId: session.user.id, search, status, priority, page, limit });
    return NextResponse.json({ tasks: result.tasks, pagination: result });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const body = await req.json();
    if (!body.title) {
      throw AppError.validationFailed("Title is required");
    }

    const task = await createTask(session.user.id, body);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
