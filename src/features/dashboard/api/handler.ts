/**
 * features/dashboard/api/handler.ts
 *
 * HTTP Translation Layer for all dashboard endpoints.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import {
  getKpis,
  getAnalytics,
  getPipelineStats,
  getRecentActivities,
  getTaskStats,
} from "../services/dashboard-service";

async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

function handleError(err: unknown) {
  if (err instanceof Error && err.message === "UNAUTHORIZED")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function handleGetKpis() {
  try {
    const userId = await requireAuth();
    const data = await getKpis(userId);
    return NextResponse.json(data);
  } catch (err) { return handleError(err); }
}

export async function handleGetAnalytics() {
  try {
    const userId = await requireAuth();
    const data = await getAnalytics(userId);
    return NextResponse.json(data);
  } catch (err) { return handleError(err); }
}

export async function handleGetPipeline() {
  try {
    const userId = await requireAuth();
    const data = await getPipelineStats(userId);
    return NextResponse.json(data);
  } catch (err) { return handleError(err); }
}

export async function handleGetActivities() {
  try {
    const userId = await requireAuth();
    const data = await getRecentActivities(userId);
    return NextResponse.json(data);
  } catch (err) { return handleError(err); }
}

export async function handleGetTaskStats() {
  try {
    const userId = await requireAuth();
    const data = await getTaskStats(userId);
    return NextResponse.json(data);
  } catch (err) { return handleError(err); }
}
