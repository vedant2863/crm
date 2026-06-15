import { NextRequest } from "next/server";
import { handleGetDeals, handleCreateDeal } from "@/features/deals/api/handler";

export async function GET(req: NextRequest) {
  return handleGetDeals(req);
}

export async function POST(req: NextRequest) {
  return handleCreateDeal(req);
}
