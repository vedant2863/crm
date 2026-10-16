"use client";

import React from "react";
import { MetricCard } from "@/components/common";

interface LeadKpiCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  accent?: any;
}

export function LeadKpiCard({ label, value, subtitle, icon: Icon, accent }: LeadKpiCardProps) {
  return (
    <MetricCard
      label={label}
      value={value}
      subtitle={subtitle}
      icon={Icon}
    />
  );
}
