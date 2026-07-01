import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { validateObjectId } from "@/lib/validation";
import { updateNote, deleteNote } from "@/features/notes/services/note-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    const body = await req.json();
    const note = await updateNote(id, session.user.id, body);
    return NextResponse.json({ note });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    await deleteNote(id, session.user.id);
    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
