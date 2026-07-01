import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { validateObjectId } from "@/lib/validation";
import { getTaskById, updateTask, deleteTask } from "@/features/tasks/services/task-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    const task = await getTaskById(id, session.user.id);
    return NextResponse.json({ task });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    const body = await req.json();
    const task = await updateTask(id, session.user.id, body);
    return NextResponse.json({ task });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    await deleteTask(id, session.user.id);
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
