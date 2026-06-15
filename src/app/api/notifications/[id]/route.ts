import { NextRequest } from "next/server";
import { handleMarkAsRead } from "@/features/notifications/api/handler";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleMarkAsRead(req, id);
}
