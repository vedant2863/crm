import { NextRequest } from "next/server";
import { handleGetNotes, handleCreateNote } from "@/features/notes/api/handler";

export async function GET(req: NextRequest) {
  return handleGetNotes(req);
}

export async function POST(req: NextRequest) {
  return handleCreateNote(req);
}
