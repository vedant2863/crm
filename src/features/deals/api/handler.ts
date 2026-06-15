/**
 * features/deals/api/handler.ts
 *
 * HTTP Translation Layer for deals.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
} from "../services/deal-service";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

function handleError(err: unknown) {
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "NOT_FOUND") return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function handleGetDeals(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(req.url);
    const result = await getDeals({
      userId,
      search: searchParams.get("search"),
      stage: searchParams.get("stage"),
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 100),
    });
    return NextResponse.json({ deals: result.deals, pagination: result });
  } catch (err) { return handleError(err); }
}

export async function handleGetDeal(_req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    const deal = await getDealById(id, userId);
    return NextResponse.json({ deal });
  } catch (err) { return handleError(err); }
}

export async function handleCreateDeal(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    if (!body.title || !body.value)
      return NextResponse.json({ error: "Title and value are required" }, { status: 400 });
    const deal = await createDeal(userId, body);
    return NextResponse.json({ deal }, { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function handleUpdateDeal(req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const deal = await updateDeal(id, userId, body);
    return NextResponse.json({ deal });
  } catch (err) { return handleError(err); }
}

export async function handleDeleteDeal(_req: NextRequest, id: string) {
  try {
    const userId = await requireAuth();
    await deleteDeal(id, userId);
    return NextResponse.json({ message: "Deal deleted successfully" });
  } catch (err) { return handleError(err); }
}
