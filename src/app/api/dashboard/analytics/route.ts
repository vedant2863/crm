import { handleGetAnalytics } from "@/features/dashboard/api/handler";

export async function GET() {
  return handleGetAnalytics();
}
