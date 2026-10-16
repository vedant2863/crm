"use client";

import type { ComponentType } from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  accent?: "default" | "primary" | "emerald" | "amber" | "rose" | "blue" | "purple";
  className?: string;
  onClick?: () => void;
}

const ACCENT_STYLES = {
  default: {
    bg: "bg-muted/40",
    border: "hover:border-border",
    iconBg: "bg-muted text-muted-foreground",
    text: "text-foreground",
  },
  primary: {
    bg: "bg-primary/[0.03]",
    border: "hover:border-primary/40",
    iconBg: "bg-primary/10 text-primary",
    text: "text-primary",
  },
  emerald: {
    bg: "bg-emerald-500/[0.03]",
    border: "hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10 text-emerald-500",
    text: "text-emerald-500",
  },
  amber: {
    bg: "bg-amber-500/[0.03]",
    border: "hover:border-amber-500/40",
    iconBg: "bg-amber-500/10 text-amber-500",
    text: "text-amber-500",
  },
  rose: {
    bg: "bg-rose-500/[0.03]",
    border: "hover:border-rose-500/40",
    iconBg: "bg-rose-500/10 text-rose-500",
    text: "text-rose-500",
  },
  blue: {
    bg: "bg-blue-500/[0.03]",
    border: "hover:border-blue-500/40",
    iconBg: "bg-blue-500/10 text-blue-500",
    text: "text-blue-500",
  },
  purple: {
    bg: "bg-purple-500/[0.03]",
    border: "hover:border-purple-500/40",
    iconBg: "bg-purple-500/10 text-purple-500",
    text: "text-purple-500",
  },
};

export function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "default",
  className,
  onClick,
}: MetricCardProps) {
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.default;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden border border-border/50 bg-card transition-all duration-300",
        styles.border,
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.99]",
        className
      )}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          {Icon && (
            <div
              className={cn(
                "p-2 rounded-xl flex items-center justify-center transition-colors",
                styles.iconBg
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {value}
          </div>

          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center font-bold px-1.5 py-0.5 rounded-md text-[10px]",
                    trend.isPositive !== false
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  )}
                >
                  {trend.isPositive !== false ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {trend.value}
                </span>
              )}
              {trend?.label && <span>{trend.label}</span>}
              {!trend && subtitle && <span>{subtitle}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;
