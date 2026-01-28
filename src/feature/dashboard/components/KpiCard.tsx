import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, LucideIcon, Minus, TrendingUp } from "lucide-react";
import React from "react";

interface KpiCardProps {
  label: string;
  stats: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number | string;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  className?: string;
}

export function KpiCard({
  label,
  stats,
  icon: Icon,
  subtitle,
  trend,
  className,
}: KpiCardProps) {
  const isUp = trend?.direction === "up";
  const isDown = trend?.direction === "down";

  return (
    <Card className={cn(
      "group relative overflow-hidden border-none shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-card/50",
      className
    )}>
      {/* Subtle background glow */}
      <div className={cn(
        "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
        isUp ? "bg-emerald-500" : isDown ? "bg-rose-500" : "bg-primary"
      )} />

      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-2xl transition-colors",
            isUp ? "bg-emerald-500/10 text-emerald-600" : isDown ? "bg-rose-500/10 text-rose-600" : "bg-primary/10 text-primary"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tighter",
              isUp ? "bg-emerald-500/10 text-emerald-600" : isDown ? "bg-rose-500/10 text-rose-600" : "bg-muted text-muted-foreground"
            )}>
              {isUp && <ArrowUp className="h-3 w-3" />}
              {isDown && <ArrowDown className="h-3 w-3" />}
              {trend.value}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black tracking-tighter">{stats}</h3>
            {trend?.label && (
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                {trend.label}
              </span>
            )}
          </div>
        </div>

        {subtitle && !trend?.label && (
          <p className="mt-2 text-xs text-muted-foreground font-medium italic opacity-80">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default React.memo(KpiCard);

