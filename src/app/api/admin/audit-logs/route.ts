import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { handleApiError, AppError } from "@/lib/errors";
import { getAuditLogs } from "@/features/enterprise/services/enterprise-service";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw AppError.unauthorized();

    const logs = await getAuditLogs(session.user.id);
    return NextResponse.json({ logs });
  } catch (err) {
    return handleApiError(err);
  }
}
