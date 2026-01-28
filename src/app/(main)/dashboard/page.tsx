"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import WelcomeSection from "@/feature/dashboard/components/shared/WelcomeSection";
import KpiCardsList from "@/feature/dashboard/components/shared/KpiCardList";
import DealPipelineCard from "@/feature/dashboard/components/shared/DealPipelineCard";
import RecentActivity from "@/feature/dashboard/components/shared/RecentActivity";
import QuickActions from "@/feature/dashboard/components/shared/QuickActions";
import DashboardSkeleton from "@/feature/dashboard/components/DashboardSkeleton";
import { useDashboard } from "@/feature/dashboard/hooks/useDashboard";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { stats, loading, error, refresh } = useDashboard();

  

  if (status === "loading" || loading) {
    console.log("stats loading:", stats);
    return <DashboardSkeleton loading={loading} status="loading" />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">
            You need to be logged in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refresh}>Reload</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeSection name={session?.user?.name} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCardsList stats={stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealPipelineCard
          chartData={stats.pipelineStats ?? []}
          totalPipelineDeals={stats.totalDeals ?? 0}
          totalPipelineValue={stats.totalRevenue ?? 0}
        />
        <RecentActivity activities={stats.recentActivities ?? []} />
      </div>

      <QuickActions />
    </div>
  );
}
