import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { sanitizeString } from "@/lib/validation";
import { getNotes, createNote } from "@/features/notes/services/note-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { searchParams } = new URL(req.url);
    const notes = await getNotes({
      userId: session.user.id,
      search: sanitizeString(searchParams.get("search"), 200) || undefined,
      dealId: searchParams.get("dealId"),
    });
    return NextResponse.json({ notes });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const body = await req.json();
    if (!body.content) {
      throw AppError.validationFailed("Content is required");
    }

    const note = await createNote(session.user.id, body);
    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
