"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Users, Target, DollarSign, TrendingUp,
  ArrowUp, ArrowDown, Activity, Zap,
  CheckCircle2, Briefcase, UserPlus, Clock,
  ChevronRight, BarChart3, RefreshCw, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardKpis } from "@/features/dashboard/hooks/useDashboardKpis";
import { useDashboardAnalytics } from "@/features/dashboard/hooks/useDashboardAnalytics";
import { useDashboardPipeline } from "@/features/dashboard/hooks/useDashboardPipeline";
import { useDashboardActivities } from "@/features/dashboard/hooks/useDashboardActivities";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("@/features/dashboard/components/RevenueChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-3xl" />,
});

const StageChart = dynamic(() => import("@/features/dashboard/components/StageChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-3xl" />,
});

const TaskDonut = dynamic(() => import("@/features/dashboard/components/TaskDonut"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-3xl" />,
});

const PipelineFunnel = dynamic(() => import("@/features/dashboard/components/PipelineFunnel"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-3xl" />,
});

const ActivityFeed = dynamic(() => import("@/features/dashboard/components/ActivityFeed"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-3xl" />,
});

const QuickActions = dynamic(() => import("@/features/dashboard/components/DashboardQuickActions"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-3xl" />,
});

/* ─── colour palette (matches design system) ─────────────────── */
const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const STAGE_COLORS: Record<string, string> = {
  New: "#6366f1",
  Contacted: "#8b5cf6",
  Qualified: "#06b6d4",
  Proposal: "#10b981",
  Negotiation: "#f59e0b",
  Won: "#22c55e",
  Lost: "#ef4444",
};

/* ─── helpers ──────────────────────────────────────────────────── */
function activityIcon(type: string) {
  switch (type) {
    case "contact": return { Icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-500/10" };
    case "deal":    return { Icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    case "task":    return { Icon: CheckCircle2, color: "text-violet-500", bg: "bg-violet-500/10" };
    default:        return { Icon: Clock, color: "text-muted-foreground", bg: "bg-muted/50" };
  }
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── Hero Header ────────────────────────────────────────────────── */
function HeroHeader({ name }: { name?: string | null }) {
  const [now, setNow] = useState(new Date());
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    fetch("/api/dashboard/tasks-stats")
      .then(r => r.json())
      .then(d => setTaskCount(d.taskStats?.todo ?? 0))
      .catch(() => {});
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : hour < 22 ? "Good evening" : "Good night";
  const emoji    = hour < 12 ? "🌅" : hour < 18 ? "☀️" : hour < 22 ? "🌆" : "🌙";

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 md:p-8"
      style={{
        background: "linear-gradient(135deg, oklch(0.55 0.18 260 / 0.9) 0%, oklch(0.45 0.22 290 / 0.85) 50%, oklch(0.50 0.20 240 / 0.9) 100%)",
      }}>
      {/* Animated blobs */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute top-4 right-1/3 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left — greeting */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm ring-1 ring-white/20">
            {emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-white/70 uppercase tracking-widest">{format(now, "EEEE, MMMM do")}</p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {greeting}, <span className="text-white/90">{name?.split(" ")[0] ?? "Partner"}</span>!
            </h1>
            {taskCount > 0 && (
              <p className="mt-1 text-sm text-white/70">
                You have <span className="font-bold text-white">{taskCount} task{taskCount > 1 ? "s" : ""}</span> pending today.
              </p>
            )}
          </div>
        </div>

        {/* Right — live clock */}
        <div className="flex shrink-0 flex-col items-start md:items-end rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm ring-1 ring-white/15">
          <span className="text-3xl font-black tabular-nums tracking-tighter text-white">
            {format(now, "HH:mm:ss")}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mt-0.5">Local time</span>
        </div>
      </div>
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────── */
interface KpiProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: string; dir: "up" | "down" };
  accent: string;
  loading?: boolean;
}
function KpiCard({ label, value, icon: Icon, trend, accent, loading }: KpiProps) {
  if (loading) return <Skeleton className="h-32 w-full rounded-3xl" />;
  const up = trend?.dir === "up";
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-3xl border bg-card/60 p-5 backdrop-blur-sm transition-all duration-300",
      "hover:-translate-y-1 hover:shadow-xl hover:border-primary/20"
    )}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }} />
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-2xl" style={{ background: `${accent}20` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        {trend && (
          <span className={cn(
            "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
            up ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
               : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}>
            {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
    </div>
  );
}

/* ─── Refresh button ──────────────────────────────────────────── */
function RefreshButton({ onRefresh, spinning }: { onRefresh: () => void; spinning: boolean }) {
  return (
    <button onClick={onRefresh}
      className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-primary/5 border border-transparent hover:border-primary/10">
      <RefreshCw className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
      Refresh
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: session } = useSession();
  const { stats, loading: kpiLoading, refresh: refreshKpis } = useDashboardKpis();
  const { data: analytics, loading: analyticsLoading, refresh: refreshAnalytics } = useDashboardAnalytics();
  const { pipelineStats, loading: pipelineLoading, refresh: refreshPipeline } = useDashboardPipeline();
  const { activities, loading: activityLoading, refresh: refreshActivities } = useDashboardActivities();

  const [spinning, setSpinning] = useState(false);

  const refreshAll = useCallback(() => {
    setSpinning(true);
    Promise.all([refreshKpis(), refreshAnalytics(), refreshPipeline(), refreshActivities()])
      .finally(() => setTimeout(() => setSpinning(false), 800));
  }, [refreshKpis, refreshAnalytics, refreshPipeline, refreshActivities]);

  /* pulse-in stagger on mount */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className={cn(
      "flex flex-col gap-5 pb-8 transition-opacity duration-500",
      mounted ? "opacity-100" : "opacity-0"
    )}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Welcome back &mdash; here&apos;s what&apos;s happening.</p>
        </div>
        <RefreshButton onRefresh={refreshAll} spinning={spinning} />
      </div>

      {/* ── Hero ── */}
      <HeroHeader name={session?.user?.name} />

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Contacts" value={stats?.totalContacts ?? "—"} icon={Users}
          trend={{ value: "12%", dir: "up" }} accent="#6366f1" loading={kpiLoading} />
        <KpiCard label="Total Deals" value={stats?.totalDeals ?? "—"} icon={Target}
          trend={{ value: "5%", dir: "down" }} accent="#10b981" loading={kpiLoading} />
        <KpiCard label="Total Revenue" value={stats ? `$${stats.totalRevenue.toLocaleString()}` : "—"} icon={DollarSign}
          trend={{ value: "18%", dir: "up" }} accent="#f59e0b" loading={kpiLoading} />
        <KpiCard label="Conversion Rate" value={stats ? `${stats.conversionRate}%` : "—"} icon={TrendingUp}
          trend={{ value: "2.3%", dir: "up" }} accent="#8b5cf6" loading={kpiLoading} />
      </div>

      {/* ── Revenue Chart + Pipeline Funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart — 2 cols */}
        <div className="lg:col-span-2 min-h-[300px]">
          <RevenueChart data={analytics?.forecastData ?? []} loading={analyticsLoading} />
        </div>
        {/* Pipeline funnel — 1 col */}
        <PipelineFunnel data={pipelineStats} loading={pipelineLoading} />
      </div>

      {/* ── Stage Chart + Activity + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stage bar chart — 2 cols */}
        <div className="lg:col-span-2 min-h-[280px]">
          <StageChart data={analytics?.stageData ?? []} loading={analyticsLoading} />
        </div>
        {/* Quick actions — 1 col */}
        <QuickActions />
      </div>

      {/* ── Task Donut Charts + Activity Feed ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TaskDonut
          title="Task Priority Distribution"
          data={analytics?.taskData.priorityData ?? []}
          loading={analyticsLoading}
        />
        <TaskDonut
          title="Task Status Distribution"
          data={analytics?.taskData.statusData ?? []}
          loading={analyticsLoading}
        />
        <ActivityFeed activities={activities} loading={activityLoading} />
      </div>

    </div>
  );
}
