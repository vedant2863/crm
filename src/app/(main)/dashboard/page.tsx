"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Plus, Sparkles, RefreshCw, Layers, Calendar, 
  ArrowUpRight, ArrowUp, CheckCircle2, AlertCircle, 
  TrendingUp, CircleDollarSign, Target, User, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  AreaChart,
  Area
} from "recharts";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// Static mock data for Pipeline Engagement (monthly leads)
const MONTHLY_ENGAGEMENT = [
  { month: "Jan", count: 1 },
  { month: "Feb", count: 5 },
  { month: "Mar", count: 6 },
  { month: "Apr", count: 10 },
  { month: "May", count: 8 },
  { month: "Jun", count: 7 },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  
  // Dashboard Aggregation States
  const [dbData, setDbData] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // AI Sales Insights States
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNoKey, setAiNoKey] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [aiRefreshCount, setAiRefreshCount] = useState(0);
  const AI_REFRESH_LIMIT = 5;

  // UI state toggles
  const [engagementPeriod, setEngagementPeriod] = useState<"Monthly" | "Annually">("Monthly");

  // Fetch Dashboard Database Aggregations
  const fetchDashboardData = useCallback(async () => {
    try {
      setDbLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const data = await res.json();
      setDbData(data);
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setDbLoading(false);
    }
  }, []);

  // Fetch AI Insights
  const fetchAiInsights = useCallback(async (force = false) => {
    setAiLoading(true);
    try {
      const url = force ? "/api/ai/sales-insights?force=true" : "/api/ai/sales-insights";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to generate AI insights");
      const data = await res.json();
      const providerName = data.provider === "Gemini (with Groq Fallback)" ? null : data.provider;
      if (data.provider) setAiProvider(providerName);
      if (data.noApiKey) {
        setAiNoKey(true);
        setAiError(false);
        setAiInsights(null);
      } else if (data.aiError) {
        setAiError(true);
        setAiNoKey(false);
        setAiInsights(null);
        if (force) toast.error("AI service temporarily unavailable.");
      } else {
        setAiNoKey(false);
        setAiError(false);
        setAiInsights(data.insights);
        if (force) {
          setAiRefreshCount(prev => prev + 1);
          toast.success(`AI Insights Refreshed via ${providerName ?? "AI"}`);
        }
      }
    } catch (err: any) {
      console.error("AI Insights Error:", err);
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
      fetchAiInsights();
    }
  }, [status, fetchDashboardData, fetchAiInsights]);

  const handleRefreshAll = () => {
    fetchDashboardData();
    fetchAiInsights(true);
  };

  if (status === "loading" || (dbLoading && !dbData)) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to view the dashboard.</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Error Loading Dashboard</h1>
          <p className="text-muted-foreground">{dbError}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const pipelineValue = dbData?.pipelineStats?.reduce((sum: number, stage: any) => sum + stage.value, 0) || 0;
  const wonValue = dbData?.totalRevenue || 0;
  const conversionPercent = dbData?.conversionRate || 0;
  const totalLeads = dbData?.totalDeals || 0;
  const pendingTasks = dbData?.totalTasks || 0;

  // Format activity feed items list
  const recentMovements = dbData?.recentActivities || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Welcome Back, <span className="text-primary italic">{session?.user?.name || "Partner"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here is an overview of your sales ecosystem today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-full px-4 py-2 bg-card text-xs font-bold text-muted-foreground shadow-sm">
            <Calendar className="h-3.5 w-3.5 mr-2" /> 01 Jan - 21 Jun, 2026
          </div>
          <Button 
            onClick={handleRefreshAll}
            variant="outline"
            size="icon"
            className="rounded-full shadow-sm"
            title="Refresh Dashboard"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ================= COLUMN 1: WIDGETS ================= */}
        <div className="flex flex-col gap-6">
          
          {/* Widget 1: Pipeline Goal Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-6 shadow-xl shadow-blue-500/10 flex flex-col gap-6 relative overflow-hidden h-[210px] justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-xl" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">Pipeline Goal</span>
                <p className="text-xs font-bold opacity-90 mt-0.5">Total deal value</p>
              </div>
              <div className="bg-white/15 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-white/10">
                TTP CRM
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Pipeline Value</span>
              <p className="text-3xl font-black tracking-tight leading-none">${pipelineValue.toLocaleString()}</p>
            </div>

            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase opacity-75">
              <span>•••• Pipeline</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
          </div>

          {/* Widget 2: Weekly Revenue Card */}
          <div className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weekly Revenue</span>
              <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUp className="h-3 w-3" /> 12.8%
              </span>
            </div>
            <p className="text-3xl font-black text-foreground">${(wonValue / 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Based on closed won deals this week</p>
          </div>

          {/* Widget 3: Conversion Card */}
          <div className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
              <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUp className="h-3 w-3" /> 4.1%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-black tracking-tight text-foreground">{conversionPercent}%</p>
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${conversionPercent}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{totalLeads} leads • {pendingTasks} open tasks</p>
              </div>
            </div>
          </div>

          {/* Widget 4: Upcoming Follow-ups List */}
          <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Upcoming Follow-ups</h3>
                <p className="text-[10px] text-muted-foreground">Don&apos;t let these slip</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {dbData?.upcomingFollowups && dbData.upcomingFollowups.length > 0 ? (
                dbData.upcomingFollowups.map((item: any) => (
                  <FollowUpItem
                    key={item.id}
                    title={item.title}
                    priority={item.priority}
                    date={item.date}
                    contact={item.contact}
                  />
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground italic py-2 text-center">No upcoming follow-ups</p>
              )}
            </div>
          </div>

        </div>

        {/* ================= COLUMN 2: MIDDLE COLUMN ================= */}
        <div className="flex flex-col gap-6">
          
          {/* Widget 5: Pipeline Engagement Bar Chart */}
          <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-sm text-foreground">Pipeline Engagement</h3>
                <p className="text-[10px] text-muted-foreground">New leads per month</p>
              </div>
              <div className="flex border rounded-full p-1 bg-muted/30 shrink-0 text-xs">
                <button 
                  onClick={() => setEngagementPeriod("Monthly")} 
                  className={cn("px-3 py-1 rounded-full font-bold", engagementPeriod === "Monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setEngagementPeriod("Annually")} 
                  className={cn("px-3 py-1 rounded-full font-bold", engagementPeriod === "Annually" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
                >
                  Annually
                </button>
              </div>
            </div>

            <div className="h-48 w-full relative">
              {/* Highlight badge overlay */}
              <div className="absolute top-2 right-12 z-10 bg-blue-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-400/20 shadow-md">
                +28.6%
              </div>
              
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dbData?.monthlyEngagement || MONTHLY_ENGAGEMENT} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: "bold" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: "bold" }} />
                  <ChartTooltip cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} />
                  <Bar dataKey="count" fill="oklch(0.55 0.18 260)" radius={[8, 8, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Widget 6: Lead Activity movements table */}
          <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Lead Activity</h3>
                <p className="text-[10px] text-muted-foreground">Recent lead movements</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="border-b uppercase font-bold tracking-wider text-muted-foreground/80">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {recentMovements.map((act: any) => {
                    const initial = act.description ? act.description.charAt(0).toUpperCase() : "L";
                    const isNew = act.description.toLowerCase().includes("added");
                    const isWon = act.description.toLowerCase().includes("won") || act.description.toLowerCase().includes("completed");
                    const isQualified = act.description.toLowerCase().includes("qualified");
                    
                    return (
                      <tr key={act.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-2.5 font-bold flex items-center gap-2 max-w-[120px]">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[8px] shrink-0">
                            {initial}
                          </div>
                          <span className="truncate">{act.description.split(" added")[0].split(" moved")[0].split(" Task")[0].split(" contact")[0].split(":")[0]}</span>
                        </td>
                        <td className="py-2.5 text-muted-foreground">{act.dateStr || "Recent"}</td>
                        <td className="py-2.5 text-muted-foreground">{act.timeStr || ""}</td>
                        <td className="py-2.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase",
                            isWon ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                            isQualified ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                            "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          )}>
                            {isWon ? "Won" : isQualified ? "Qualified" : "New"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-black text-foreground">
                          {act.value ? `$${act.value.toLocaleString()}` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                  {recentMovements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted-foreground italic">No recent movements</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ================= COLUMN 3: RIGHT COLUMN ================= */}
        <div className="flex flex-col gap-6">
          
          {/* Widget 7: Revenue Goal Area Chart */}
          <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Revenue Goal</h3>
                <p className="text-[10px] text-muted-foreground">Closed-won total</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Total Won</span>
              <p className="text-3xl font-black text-foreground">${wonValue.toLocaleString()}</p>
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dbData?.revenueProgressData || [
                  { day: "1", value: 0 },
                  { day: "2", value: wonValue }
                ]} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <ChartTooltip cursor={false} />
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.18 260)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="oklch(0.55 0.18 260)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="oklch(0.55 0.18 260)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-2.5">
              <Button onClick={() => window.location.href = "/leads"} className="flex-1 rounded-full font-bold h-9 text-xs">
                + Add Lead
              </Button>
              <Button onClick={() => window.location.href = "/follow-ups"} variant="outline" className="flex-1 rounded-full font-bold h-9 text-xs">
                Task
              </Button>
            </div>
          </div>

          {/* Widget 8: AI Sales Insights Widget */}
          <div className="border border-primary/20 rounded-3xl bg-primary/5 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" /> AI Sales Insights
                </div>
                {aiProvider && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {aiProvider}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {/* Refresh counter badge */}
                {!aiNoKey && (
                  <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded-full border",
                    aiRefreshCount >= AI_REFRESH_LIMIT
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      : "bg-muted text-muted-foreground border-border/40"
                  )}>
                    {aiRefreshCount >= AI_REFRESH_LIMIT ? "Limit reached" : `${AI_REFRESH_LIMIT - aiRefreshCount} left`}
                  </span>
                )}
                <button
                  onClick={() => fetchAiInsights(true)}
                  disabled={aiLoading || aiRefreshCount >= AI_REFRESH_LIMIT}
                  className={cn(
                    "p-1 rounded-full transition-colors border",
                    aiRefreshCount >= AI_REFRESH_LIMIT
                      ? "text-muted-foreground/30 border-border/20 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title={aiRefreshCount >= AI_REFRESH_LIMIT ? "Refresh limit reached (5/5)" : `Refresh Insights (${AI_REFRESH_LIMIT - aiRefreshCount} remaining)`}
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", aiLoading && "animate-spin")} />
                </button>
              </div>
            </div>

            {aiLoading && (
              <div className="space-y-2 py-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}

            {/* No API Key Banner */}
            {!aiLoading && aiNoKey && (
              <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">No API Key Configured</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[200px]">
                    AI service is unavailable. Add{" "}
                    <code className="font-mono bg-muted px-1 py-0.5 rounded text-[9px]">GEMINI_API_KEY</code>{" "}
                    to your <code className="font-mono bg-muted px-1 py-0.5 rounded text-[9px]">.env</code> file to enable AI insights.
                  </p>
                </div>
              </div>
            )}

            {!aiLoading && !aiNoKey && aiInsights && (
              <div className="space-y-4 text-xs">
                
                {/* Health Score */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Health Score</span>
                    <span className="text-primary font-black">{aiInsights.healthScore}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${aiInsights.healthScore}%` }} />
                  </div>
                </div>

                {/* Observations */}
                {aiInsights.observations && aiInsights.observations.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">Observations</span>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground font-medium pl-1">
                      {aiInsights.observations.map((obs: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-primary block">Recommendations</span>
                    <ul className="list-disc list-inside space-y-1 text-primary font-bold pl-1">
                      {aiInsights.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

// Sub-widgets
interface FollowUpItemProps {
  title: string;
  priority: "low" | "medium" | "high";
  date: string;
  contact: string;
}
function FollowUpItem({ title, priority, date, contact }: FollowUpItemProps) {
  return (
    <div className="flex items-center justify-between border-b pb-2.5 last:border-none last:pb-0 text-xs">
      <div className="min-w-0">
        <h4 className="font-bold text-foreground truncate">{title}</h4>
        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{date} • {contact}</p>
      </div>
      <span className={cn(
        "text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0",
        priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
        priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
        "bg-gray-500/10 text-gray-600 border-gray-500/20"
      )}>
        {priority}
      </span>
    </div>
  );
}
