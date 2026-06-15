import { NextRequest } from "next/server";
import { handleSearch } from "@/features/search/api/handler";

export async function GET(req: NextRequest) {
  return handleSearch(req);
}
