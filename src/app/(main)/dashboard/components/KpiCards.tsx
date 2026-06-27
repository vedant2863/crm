import { ArrowUp } from "lucide-react";

interface KpiCardsProps {
  pipelineValue: number;
  wonValue: number;
  conversionPercent: number;
  totalLeads: number;
  pendingTasks: number;
}

export function KpiCards({
  pipelineValue,
  wonValue,
  conversionPercent,
  totalLeads,
  pendingTasks,
}: KpiCardsProps) {
  return (
    <>
      {/* Widget 1: Pipeline Goal Card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-6 shadow-xl shadow-blue-500/10 flex flex-col gap-6 relative overflow-hidden h-[210px] justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-xl" />

        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">Pipeline Goal</span>
            <p className="text-xs font-bold opacity-90 mt-0.5">Total deal value</p>
          </div>
          <div className="bg-white/15 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-white/10">
            TTP CRM
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Pipeline Value</span>
          <p className="text-3xl font-black tracking-tight leading-none">${pipelineValue.toLocaleString()}</p>
        </div>

        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase opacity-75">
          <span>•••• Pipeline</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>
      </div>

      {/* Widget 2: Weekly Revenue Card */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weekly Revenue</span>
          <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ArrowUp className="h-3 w-3" /> 12.8%
          </span>
        </div>
        <p className="text-3xl font-black text-foreground">${(wonValue / 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        <p className="text-[10px] text-muted-foreground font-medium mt-1">Based on closed won deals this week</p>
      </div>

      {/* Widget 3: Conversion Card */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
          <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ArrowUp className="h-3 w-3" /> 4.1%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-4xl font-black tracking-tight text-foreground">{conversionPercent}%</p>
          <div className="flex-1 space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${conversionPercent}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{totalLeads} leads • {pendingTasks} open tasks</p>
          </div>
        </div>
      </div>
    </>
  );
}
