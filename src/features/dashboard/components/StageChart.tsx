"use client";

import {
  BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PALETTE } from "@/features/dashboard/constants";

interface StageItem {
  stage: string;
  value: number;
  count: number;
}

interface StageChartProps {
  data: StageItem[];
  loading: boolean;
}

export default function StageChart({ data, loading }: StageChartProps) {
  if (loading) return <Skeleton className="h-full w-full rounded-3xl" />;

  return (
    <div className="flex flex-col rounded-3xl border bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-2">
        <h3 className="font-black text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" /> Stage Valuation
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Deal value by pipeline stage</p>
      </div>

      {/* Chart */}
      <div className="flex-1 px-2 pb-4 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              className="text-[10px] fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v / 1000}k`}
              className="text-[10px] fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              }}
              formatter={(
                v: number | string,
                _: string,
                props: { payload?: { count?: number } }
              ) => [
                `$${Number(v).toLocaleString()} (${props.payload?.count ?? 0} deals)`,
                "Value",
              ]}
              labelStyle={{ fontWeight: 700 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
