"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { PALETTE } from "@/features/dashboard/constants";

interface DistributionItem {
  name: string;
  value: number;
}

interface TaskDonutProps {
  title: string;
  data: DistributionItem[];
  loading: boolean;
}

export default function TaskDonut({ title, data, loading }: TaskDonutProps) {
  if (loading) return <Skeleton className="h-full w-full rounded-3xl" />;

  const hasData = data.some(d => d.value > 0);

  return (
    <div className="flex flex-col rounded-3xl border bg-card/60 backdrop-blur-sm p-5 gap-2">
      <h3 className="font-black text-sm text-foreground">{title}</h3>

      <div className="flex-1 min-h-[180px]">
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-xs italic text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={30}
                iconType="circle"
                iconSize={7}
                formatter={v => (
                  <span className="text-[11px] font-semibold text-muted-foreground">{v}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
