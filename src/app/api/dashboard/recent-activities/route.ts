import { handleGetActivities } from "@/features/dashboard/api/handler";

export async function GET() {
  return handleGetActivities();
}
