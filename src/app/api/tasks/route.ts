import { NextRequest } from "next/server";
import { handleGetTasks, handleCreateTask } from "@/features/tasks/api/handler";

export async function GET(req: NextRequest) {
  return handleGetTasks(req);
}

export async function POST(req: NextRequest) {
  return handleCreateTask(req);
}
