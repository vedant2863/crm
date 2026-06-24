/**
 * features/tasks/api/handler.ts
 *
 * HTTP Translation Layer for tasks.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../services/task-service";

async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

function handleError(err: unknown) {
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "NOT_FOUND") return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function handleGetTasks(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(req.url);
    const result = await getTasks({
      userId,
      search: searchParams.get("search"),
      status: searchParams.get("status"),
      priority: searchParams.get("priority"),
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 100),
    });
    return NextResponse.json({ tasks: result.tasks, pagination: result });
  } catch (err) { return handleError(err); }
}

export async function handleGetTask(_req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    const task = await getTaskById(id, userId);
    return NextResponse.json({ task });
  } catch (err) { return handleError(err); }
}

export async function handleCreateTask(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    if (!body.title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    const task = await createTask(userId, body);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function handleUpdateTask(req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const task = await updateTask(id, userId, body);
    return NextResponse.json({ task });
  } catch (err) { return handleError(err); }
}

export async function handleDeleteTask(_req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    await deleteTask(id, userId);
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (err) { return handleError(err); }
}
