"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
  showDot?: boolean;
}

const STATUS_MAP: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  // Deals & Leads Stages
  new: {
    label: "New",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },
  qualified: {
    label: "Qualified",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  proposal: {
    label: "Proposal",
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
  },
  won: {
    label: "Won",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  lost: {
    label: "Lost",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
  },

  // Task Statuses
  pending: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-sky-500/10",
    text: "text-sky-500",
    border: "border-sky-500/20",
    dot: "bg-sky-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  },

  // Contact Statuses
  active: {
    label: "Active",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  prospect: {
    label: "Prospect",
    bg: "bg-sky-500/10",
    text: "text-sky-500",
    border: "border-sky-500/20",
    dot: "bg-sky-500",
  },
  lead: {
    label: "Lead",
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
    border: "border-indigo-500/20",
    dot: "bg-indigo-500",
  },
  customer: {
    label: "Customer",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  churned: {
    label: "Churned",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
  },
  inactive: {
    label: "Inactive",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
};

export function StatusBadge({
  status,
  label,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const normalizedKey = (status || "").toLowerCase().trim();
  const config = STATUS_MAP[normalizedKey] || {
    label: label || status,
    bg: "bg-muted/60",
    text: "text-foreground",
    border: "border-border/60",
    dot: "bg-foreground/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)}
        />
      )}
      <span>{label || config.label}</span>
    </span>
  );
}

export default StatusBadge;
