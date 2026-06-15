/**
 * features/search/api/handler.ts
 *
 * HTTP Translation Layer for global search.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { searchAll } from "../services/search-service";

export async function handleSearch(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit") || 20);

    const result = await searchAll({ userId: session.user.id, query, limit });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
