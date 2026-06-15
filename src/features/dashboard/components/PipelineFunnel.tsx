"use client";

import { Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { STAGE_COLORS } from "@/features/dashboard/constants";

interface PipelineStat {
  stage: string;
  count: number;
  value: number;
}

interface PipelineFunnelProps {
  data: PipelineStat[];
  loading: boolean;
}

export default function PipelineFunnel({ data, loading }: PipelineFunnelProps) {
  if (loading) return <Skeleton className="h-full w-full rounded-3xl" />;

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-3xl border bg-card/60 backdrop-blur-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-black text-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> Deal Pipeline
        </h3>
        <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
          {total} deals
        </span>
      </div>

      {/* Stage bars */}
      <div className="space-y-2.5">
        {data.map((item) => {
          const pct = total > 0 ? (item.count / total) * 100 : 0;
          const color = STAGE_COLORS[item.stage] ?? "#6366f1";
          return (
            <div key={item.stage} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{item.stage}</span>
                <span className="font-bold text-muted-foreground">
                  {item.count} &middot; ${(item.value / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <p className="text-center text-sm italic text-muted-foreground py-6">
            No pipeline data yet
          </p>
        )}
      </div>
    </div>
  );
}
