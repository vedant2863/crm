import React from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Deal } from "@/features/deals";

interface LeadCardViewProps {
  sortedLeads: Deal[];
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  handleOpenDrawer: (lead: Deal) => void;
  DEAL_STAGES: { key: string; label: string; color: string }[];
}

export function LeadCardView({
  sortedLeads,
  selectedIds,
  toggleSelect,
  handleOpenDrawer,
  DEAL_STAGES,
}: LeadCardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedLeads.map((lead) => {
        const stageObj = DEAL_STAGES.find(s => s.key === lead.stage);
        const source = lead.tags && lead.tags.length > 0 ? lead.tags[0] : "Other";
        const initial = lead.contactName ? lead.contactName.charAt(0).toUpperCase() : "L";

        return (
          <div
            key={lead._id}
            className={cn(
              "group relative bg-card border rounded-3xl p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col gap-4 min-h-[180px]",
              selectedIds.includes(lead._id) && "border-primary bg-primary/5"
            )}
            onClick={() => handleOpenDrawer(lead)}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm text-foreground truncate group-hover:text-primary transition-colors">{lead.title}</h3>
                  <p className="text-[10px] text-muted-foreground truncate">{lead.contactName} at {lead.company || "General"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(lead._id)}
                  onChange={() => toggleSelect(lead._id)}
                  className="rounded border-gray-300 text-primary h-4.5 w-4.5"
                />
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className={cn("text-[9px] uppercase tracking-wider font-bold border-none", stageObj?.color)}>
                {stageObj?.label || lead.stage}
              </Badge>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border",
                lead.priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                  lead.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                    "bg-gray-500/10 text-gray-600 border-gray-500/20"
              )}>
                {lead.priority}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-muted border text-[9px] font-bold">
                {source}
              </span>
            </div>

            {/* Footer details */}
            <div className="flex items-end justify-between mt-auto pt-3 border-t">
              <div>
                <span className="text-[10px] text-muted-foreground font-medium block">Deal value</span>
                <span className="text-base font-black text-emerald-600">${lead.value.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-muted-foreground font-medium block">Updated</span>
                <span className="text-[10px] text-foreground font-bold">{new Date(lead.updatedAt || lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        );
      })}
      {sortedLeads.length === 0 && (
        <div className="text-center py-20 col-span-full">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No leads found</h3>
          <p className="text-muted-foreground">Adjust filters or create a new lead to populate grid.</p>
        </div>
      )}
    </div>
  );
}
