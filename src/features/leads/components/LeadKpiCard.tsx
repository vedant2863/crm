"use client";

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { MetricCard } from "@/components/common";

interface LeadKpiCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  accent?: "default" | "primary" | "emerald" | "amber" | "rose" | "blue" | "purple";
}

export function LeadKpiCard({ label, value, subtitle, icon, accent }: LeadKpiCardProps) {
  return (
    <MetricCard
      label={label}
      value={value}
      subtitle={subtitle}
      icon={icon}
      accent={accent}
    />
  );
}
