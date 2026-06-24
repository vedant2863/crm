/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip } from "recharts";
import { Button } from "@/components/ui/button";

interface RevenueGoalChartProps {
  wonValue: number;
  revenueProgressData: any[];
}

export function RevenueGoalChart({ wonValue, revenueProgressData }: RevenueGoalChartProps) {
  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-foreground">Revenue Goal</h3>
          <p className="text-[10px] text-muted-foreground">Closed-won total</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border" onClick={() => window.location.href = "/pipeline"}>
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Total Won</span>
        <p className="text-3xl font-black text-foreground">${wonValue.toLocaleString()}</p>
      </div>

      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={
              revenueProgressData?.length > 0
                ? revenueProgressData
                : [
                  { day: "Start", value: 0, date: "No data" },
                  { day: "Now", value: 0, date: "No data" },
                ]
            }
            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
          >
            <XAxis dataKey="day" hide />
            <YAxis hide />
            <ChartTooltip cursor={false} />
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.55 0.18 260)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="oklch(0.55 0.18 260)" stopOpacity={0} />
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
  );
}
