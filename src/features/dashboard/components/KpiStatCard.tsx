"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export interface KpiStatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: string; dir: "up" | "down" };
  accent: string;
  loading?: boolean;
}

export default function KpiStatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent,
  loading,
}: KpiStatCardProps) {
  if (loading) return <Skeleton className="h-32 w-full rounded-3xl" />;

  const up = trend?.dir === "up";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card/60 p-5 backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl hover:border-primary/20"
      )}
    >
      {/* Glow orb */}
      <div
        className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-2xl" style={{ background: `${accent}20` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>

        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
              up
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {trend.value}
          </span>
        )}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
    </div>
  );
}
