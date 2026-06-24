import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../services/note-service";

async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

function handleError(err: unknown) {
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "NOT_FOUND") return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function handleGetNotes(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(req.url);
    const notes = await getNotes({
      userId,
      search: searchParams.get("search"),
      dealId: searchParams.get("dealId"),
    });
    return NextResponse.json({ notes });
  } catch (err) {
    return handleError(err);
  }
}

export async function handleCreateNote(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    if (!body.content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    const note = await createNote(userId, body);
    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function handleUpdateNote(req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const note = await updateNote(id, userId, body);
    return NextResponse.json({ note });
  } catch (err) {
    return handleError(err);
  }
}

export async function handleDeleteNote(req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    await deleteNote(id, userId);
    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (err) {
    return handleError(err);
  }
}
