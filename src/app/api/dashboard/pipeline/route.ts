import { handleGetPipeline } from "@/features/dashboard/api/handler";

export async function GET() {
  return handleGetPipeline();
}
