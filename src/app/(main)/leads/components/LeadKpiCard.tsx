import React from "react";

interface LeadKpiCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
}

export function LeadKpiCard({ label, value, subtitle, icon: Icon, accent }: LeadKpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }} />
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-2xl" style={{ background: `${accent}20` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{subtitle}</span>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
    </div>
  );
}
