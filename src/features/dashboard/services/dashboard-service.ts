/**
 * features/dashboard/services/dashboard-service.ts
 *
 * Scopes all dashboard analytics, KPIs, and charts to organization level (collaborative Multi-Tenant).
 * Integrates the new Activity collection to render a live collaborative Activity timeline.
 *
 * OPTIMIZATION: Uses centralized org-cache, .lean(), .maxTimeMS(), and in-memory
 * dashboard caching (30s TTL) to reduce DB load at 1000 concurrent users.
 */
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contact";
import Deal from "@/models/deal";
import Task from "@/models/task";
import User from "@/models/user";
import Activity from "@/models/activity";
import { getOrganizationUserIds } from "@/lib/org-cache";
import { dashboardCache } from "@/lib/cache";

const DEAL_STAGES = [
  { key: "new", label: "New" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

function formatTimeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** KPIs: totalContacts, totalDeals, totalRevenue, conversionRate scoped to Org */
export async function getKpis(userId: string) {
  const cacheKey = `kpis:${userId}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached) return cached;

  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);

  const [totalContacts, totalDeals, dealStats] = await Promise.all([
    Contact.countDocuments({ userId: { $in: orgUserIds } }).maxTimeMS(10_000),
    Deal.countDocuments({ userId: { $in: orgUserIds } }).maxTimeMS(10_000),
    Deal.aggregate([
      { $match: { userId: { $in: orgUserIds } } },
      { $group: { _id: "$stage", count: { $sum: 1 }, totalValue: { $sum: "$value" } } },
    ]).option({ maxTimeMS: 10_000 }),
  ]);

  const totalRevenue = dealStats
    .filter((s) => s._id === "won")
    .reduce((sum, s) => sum + s.totalValue, 0);
  const totalLeads = dealStats.reduce((sum, s) => sum + s.count, 0);
  const wonDeals = dealStats.find((s) => s._id === "won")?.count || 0;
  const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

  const result = {
    totalContacts,
    totalDeals,
    totalRevenue,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };

  dashboardCache.set(cacheKey, result);
  return result;
}

/** Analytics: forecastData, stageData, taskData scoped to Org */
export async function getAnalytics(userId: string) {
  const cacheKey = `analytics:${userId}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached) return cached;

  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);

  const [deals, tasks] = await Promise.all([
    Deal.find({ userId: { $in: orgUserIds } })
      .select("stage value probability expectedCloseDate")
      .maxTimeMS(10_000)
      .lean(),
    Task.find({ userId: { $in: orgUserIds } })
      .select("priority status")
      .maxTimeMS(10_000)
      .lean(),
  ]);

  // Revenue forecast (6 months)
  const months: { key: string; label: string; revenue: number; dealsCount: number }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      revenue: 0,
      dealsCount: 0,
    });
  }

  interface DealLean { stage: string; value: number; probability?: number; expectedCloseDate?: Date }
  (deals as DealLean[]).forEach((deal) => {
    if (deal.stage === "lost" || !deal.expectedCloseDate) return;
    const d = new Date(deal.expectedCloseDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const m = months.find((mo) => mo.key === key);
    if (m) {
      const weight = deal.stage === "won" ? 1.0 : (deal.probability ?? 50) / 100;
      m.revenue += Math.round(deal.value * weight);
      m.dealsCount += 1;
    }
  });

  const forecastData = months.map((m) => ({ month: m.label, revenue: m.revenue, dealsCount: m.dealsCount }));

  // Stage distribution
  const stageKeys = ["new", "qualified", "proposal", "won", "lost"];
  const stageMap = new Map(stageKeys.map((s) => [s, { value: 0, count: 0 }]));
  (deals as DealLean[]).forEach((d) => {
    const cur = stageMap.get(d.stage) || { value: 0, count: 0 };
    stageMap.set(d.stage, { value: cur.value + d.value, count: cur.count + 1 });
  });
  const stageData = stageKeys.map((stage) => {
    const data = stageMap.get(stage) || { value: 0, count: 0 };
    return { stage: stage.charAt(0).toUpperCase() + stage.slice(1), ...data };
  });

  // Task distribution
  const priorityCounts: Record<string, number> = { low: 0, medium: 0, high: 0 };
  const statusCounts: Record<string, number> = { pending: 0, in_progress: 0, completed: 0, cancelled: 0 };
  interface TaskLean { priority: string; status: string }
  (tasks as TaskLean[]).forEach((t) => {
    if (t.priority in priorityCounts) priorityCounts[t.priority]++;
    if (t.status in statusCounts) statusCounts[t.status]++;
  });

  const priorityData = Object.entries(priorityCounts).map(([n, v]) => ({
    name: n.charAt(0).toUpperCase() + n.slice(1),
    value: v,
  }));
  const statusData = Object.entries(statusCounts).map(([n, v]) => ({
    name: n.replace("_", " ").split(" ").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
    value: v,
  }));

  const result = { forecastData, stageData, taskData: { priorityData, statusData } };
  dashboardCache.set(cacheKey, result);
  return result;
}

/** Pipeline funnel stats by stage scoped to Org */
export async function getPipelineStats(userId: string) {
  const cacheKey = `pipeline:${userId}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached) return cached;

  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);

  const dealStats = await Deal.aggregate([
    { $match: { userId: { $in: orgUserIds } } },
    { $group: { _id: "$stage", count: { $sum: 1 }, totalValue: { $sum: "$value" } } },
  ]).option({ maxTimeMS: 10_000 });

  const pipelineStats = DEAL_STAGES.map((stage) => {
    const stat = dealStats.find((s) => s._id === stage.key);
    return { stage: stage.label, count: stat?.count || 0, value: stat?.totalValue || 0 };
  });

  const result = { pipelineStats };
  dashboardCache.set(cacheKey, result);
  return result;
}

/** Collaborative Recent Activity Timeline */
export async function getRecentActivities(userId: string) {
  const cacheKey = `activities:${userId}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached) return cached;

  await dbConnect();
  const user = await User.findById(userId).select("company").lean();
  const company = (user as { company?: string } | null)?.company || "SoloTenant";

  // Query actual collaborative activity documents from the user's organization
  const activities = await Activity.find({ organization: company })
    .sort({ createdAt: -1 })
    .limit(7)
    .maxTimeMS(10_000)
    .lean();

  const formatted = (activities as unknown as {
    _id: { toString(): string };
    entityType: string;
    userName: string;
    action: string;
    createdAt: Date;
  }[]).map((a) => ({
    id: a._id.toString(),
    type: a.entityType,
    description: `${a.userName} ${a.action}`,
    timestamp: formatTimeAgo(a.createdAt),
  }));

  const result = { recentActivities: formatted };
  dashboardCache.set(cacheKey, result);
  return result;
}

/** Task status stats (for HeroHeader pending count) scoped to Org */
export async function getTaskStats(userId: string) {
  const cacheKey = `taskStats:${userId}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached) return cached;

  await dbConnect();
  const orgUserIds = await getOrganizationUserIds(userId);

  const stats = await Task.aggregate([
    { $match: { userId: { $in: orgUserIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]).option({ maxTimeMS: 10_000 });

  const taskStats = stats.reduce(
    (acc, s) => ({ ...acc, [s._id]: s.count }),
    {} as Record<string, number>
  );

  const result = { taskStats };
  dashboardCache.set(cacheKey, result);
  return result;
}
