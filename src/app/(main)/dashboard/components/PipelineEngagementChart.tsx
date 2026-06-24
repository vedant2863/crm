/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip } from "recharts";
import { cn } from "@/lib/utils";

interface PipelineEngagementChartProps {
  engagementPeriod: "Monthly" | "Annually";
  setEngagementPeriod: (period: "Monthly" | "Annually") => void;
  monthlyEngagementData: any[];
  MONTHLY_ENGAGEMENT_FALLBACK: any[];
}

export function PipelineEngagementChart({
  engagementPeriod,
  setEngagementPeriod,
  monthlyEngagementData,
  MONTHLY_ENGAGEMENT_FALLBACK,
}: PipelineEngagementChartProps) {
  return (
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
          <BarChart data={monthlyEngagementData || MONTHLY_ENGAGEMENT_FALLBACK} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: "bold" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: "bold" }} />
            <ChartTooltip cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} />
            <Bar dataKey="count" fill="oklch(0.55 0.18 260)" radius={[8, 8, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
