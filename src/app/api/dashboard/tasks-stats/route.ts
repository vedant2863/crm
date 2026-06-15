import { handleGetTaskStats } from "@/features/dashboard/api/handler";

export async function GET() {
  return handleGetTaskStats();
}
