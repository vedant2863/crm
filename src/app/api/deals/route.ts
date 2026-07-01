import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { validatePagination, sanitizeString } from "@/lib/validation";
import { getDeals, createDeal } from "@/features/deals/services/deal-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { searchParams } = new URL(req.url);
    const { page, limit } = validatePagination({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });
    const search = sanitizeString(searchParams.get("search"), 200) || undefined;
    const stage = sanitizeString(searchParams.get("stage"), 50) || undefined;

    const result = await getDeals({ userId: session.user.id, search, stage, page, limit });
    return NextResponse.json({ deals: result.deals, pagination: result });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const body = await req.json();
    if (!body.title || body.value === undefined) {
      throw AppError.validationFailed("Title and value are required");
    }

    const deal = await createDeal(session.user.id, body);
    return NextResponse.json({ deal }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
