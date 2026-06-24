"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Subcomponents
import { KpiCards } from "./components/KpiCards";
import { UpcomingFollowups } from "./components/UpcomingFollowups";
import { PipelineEngagementChart } from "./components/PipelineEngagementChart";
import { LeadActivityTable } from "./components/LeadActivityTable";
import { RevenueGoalChart } from "./components/RevenueGoalChart";
import { AiSalesInsights } from "./components/AiSalesInsights";
import { DashboardHeader } from "./components/DashboardHeader";

// Custom Hook
import { useDashboardState } from "./hooks/useDashboardState";

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
  const {
    session,
    status,
    dbData,
    dbLoading,
    dbError,
    aiInsights,
    aiLoading,
    aiNoKey,
    aiError,
    aiProvider,
    aiRefreshCount,
    AI_REFRESH_LIMIT,
    engagementPeriod,
    setEngagementPeriod,
    fetchDashboardData,
    fetchAiInsights,
    handleRefreshAll,
  } = useDashboardState();

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
  const pipelineValue = dbData?.pipelineStats?.reduce((sum: number, stage: any) => sum + (stage.value || 0), 0) || 0;
  const wonValue = dbData?.totalRevenue || 0;
  const rawConversion = dbData?.conversionRate ?? 0;
  const conversionPercent = isNaN(rawConversion) ? 0 : Math.min(100, Math.max(0, rawConversion));
  const totalLeads = dbData?.totalDeals || 0;
  const pendingTasks = dbData?.totalTasks || 0;

  // Format activity feed items list
  const recentMovements = dbData?.recentActivities || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">

      {/* Top Welcome Header */}
      <DashboardHeader
        userName={session?.user?.name}
        onRefreshAll={handleRefreshAll}
      />

      {/* Main Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ================= COLUMN 1: WIDGETS ================= */}
        <div className="flex flex-col gap-6">
          <KpiCards
            pipelineValue={pipelineValue}
            wonValue={wonValue}
            conversionPercent={conversionPercent}
            totalLeads={totalLeads}
            pendingTasks={pendingTasks}
          />
          <UpcomingFollowups followups={dbData?.upcomingFollowups || []} />
        </div>

        {/* ================= COLUMN 2: MIDDLE COLUMN ================= */}
        <div className="flex flex-col gap-6">
          <PipelineEngagementChart
            engagementPeriod={engagementPeriod}
            setEngagementPeriod={setEngagementPeriod}
            monthlyEngagementData={dbData?.monthlyEngagement}
            MONTHLY_ENGAGEMENT_FALLBACK={MONTHLY_ENGAGEMENT}
          />
          <LeadActivityTable recentMovements={recentMovements} />
        </div>

        {/* ================= COLUMN 3: RIGHT COLUMN ================= */}
        <div className="flex flex-col gap-6">
          <RevenueGoalChart
            wonValue={wonValue}
            revenueProgressData={dbData?.revenueProgressData}
          />
          <AiSalesInsights
            aiProvider={aiProvider}
            aiNoKey={aiNoKey}
            aiError={aiError}
            aiInsights={aiInsights}
            aiLoading={aiLoading}
            aiRefreshCount={aiRefreshCount}
            AI_REFRESH_LIMIT={AI_REFRESH_LIMIT}
            fetchAiInsights={fetchAiInsights}
          />
        </div>

      </div>

    </div>
  );
}
