"use client";

import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";

export interface PriorityBadgeProps {
  priority?: "low" | "medium" | "high" | "urgent" | string | null;
  showIcon?: boolean;
  className?: string;
}

const PRIORITY_MAP: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  low: {
    label: "Low",
    bg: "bg-slate-500/10",
    text: "text-slate-500",
    border: "border-slate-500/20",
  },
  medium: {
    label: "Medium",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
  },
  high: {
    label: "High",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/20",
  },
  urgent: {
    label: "Urgent",
    bg: "bg-red-600/15",
    text: "text-red-600",
    border: "border-red-600/30",
  },
};

export function PriorityBadge({
  priority,
  showIcon = true,
  className,
}: PriorityBadgeProps) {
  const normalizedKey = (priority || "").toLowerCase().trim();
  const config = PRIORITY_MAP[normalizedKey] || {
    label: priority,
    bg: "bg-muted/60",
    text: "text-muted-foreground",
    border: "border-border/60",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && <Flag className="h-3 w-3 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}

export default PriorityBadge;
