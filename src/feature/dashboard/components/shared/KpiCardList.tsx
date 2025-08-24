"use client";

import { Users, Target, DollarSign, TrendingUp } from "lucide-react";
import KpiCard from "@/feature/dashboard/components/KpiCard";

type PipelineStat = {
  stage: string;
  count: number;
};

type KpiStats = {
  totalContacts: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  pipelineStats: PipelineStat[];
};

export default function KpiCardList({ stats }: { stats: KpiStats }) {
  const activeDeals = stats.pipelineStats
    .filter((s) => !["won", "lost"].includes(s.stage.toLowerCase()))
    .reduce((sum, s) => sum + s.count, 0);

  return (
    // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <>
      <KpiCard
        label="Total Contacts"
        stats={stats.totalContacts}
        icon={Users}
        subtitle="+12 from last month"
      />
      <KpiCard
        label="Total Deals"
        stats={stats.totalDeals}
        icon={Target}
        subtitle={`${activeDeals} active`}
      />
      <KpiCard
        label="Total Revenue"
        stats={`$${stats.totalRevenue.toLocaleString()}`}
        icon={DollarSign}
        subtitle="+18% from last month"
      />
      <KpiCard
        label="Conversion Rate"
        stats={`${stats.conversionRate}%`}
        icon={TrendingUp}
        subtitle="+2.3% from last month"
      />
      {/* </div> */}
    </>
  );
}
