import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getAuditLogs } from "@/features/enterprise/services/enterprise-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await getAuditLogs(session.user.id);
    return NextResponse.json({ logs });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }
    console.error("Error fetching audit logs:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
