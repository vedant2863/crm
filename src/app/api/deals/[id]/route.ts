import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { validateObjectId } from "@/lib/validation";
import { getDealById, updateDeal, deleteDeal } from "@/features/deals/services/deal-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    const deal = await getDealById(id, session.user.id);
    return NextResponse.json({ deal });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    const body = await req.json();
    const deal = await updateDeal(id, session.user.id, body);
    return NextResponse.json({ deal });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { id } = await params;
    validateObjectId(id);

    await deleteDeal(id, session.user.id);
    return NextResponse.json({ message: "Deal deleted successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
