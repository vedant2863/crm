"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ForecastItem {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: ForecastItem[];
  loading: boolean;
}

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading) return <Skeleton className="h-full w-full rounded-3xl" />;

  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="flex flex-col h-full rounded-3xl border bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-2">
        <div>
          <h3 className="font-black text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Revenue Forecast
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Weighted pipeline &mdash; next 6 months
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-foreground">${total.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Projected
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-2 pb-4 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              className="text-[11px] fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v / 1000}k`}
              className="text-[11px] fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              }}
              formatter={(v: number | string) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
              labelStyle={{ fontWeight: 700, color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#revGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#6366f1" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
