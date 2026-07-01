import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { sanitizeString, validatePagination } from "@/lib/validation";
import { searchAll } from "@/features/search/services/search-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const { searchParams } = new URL(req.url);
    const query = sanitizeString(searchParams.get("q"), 200);
    const { limit } = validatePagination({ limit: searchParams.get("limit") });

    const result = await searchAll({ userId: session.user.id, query, limit });
    return NextResponse.json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
