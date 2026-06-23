import { NextRequest } from "next/server";
import { handleUpdateNote, handleDeleteNote } from "@/features/notes/api/handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return handleUpdateNote(req, id);
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return handleDeleteNote(req, id);
}
