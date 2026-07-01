import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { getKpis } from "@/features/dashboard/services/dashboard-service";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const data = await getKpis(session.user.id);
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
