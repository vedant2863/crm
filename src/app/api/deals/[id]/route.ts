import { NextRequest } from "next/server";
import { handleGetDeal, handleUpdateDeal, handleDeleteDeal } from "@/features/deals/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetDeal(req, id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateDeal(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteDeal(req, id);
}
