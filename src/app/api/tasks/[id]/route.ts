import { NextRequest } from "next/server";
import { handleGetTask, handleUpdateTask, handleDeleteTask } from "@/features/tasks/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetTask(req, id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateTask(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteTask(req, id);
}
