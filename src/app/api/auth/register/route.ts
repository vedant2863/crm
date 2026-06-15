import { NextRequest } from "next/server";
import { handleRegister } from "@/features/auth/api/handler";

export async function POST(req: NextRequest) {
  return handleRegister(req);
}
