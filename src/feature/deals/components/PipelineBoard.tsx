"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Building, DollarSign } from "lucide-react";
import { Deal } from "../types/deal";

interface Stage {
  key: string;
  label: string;
}

interface PipelineBoardProps {
  stages: Stage[];
  deals: Deal[];
  onEdit: (deal: Deal) => void;
}

export default function PipelineBoard({ stages, deals, onEdit }: PipelineBoardProps) {
  // We usually don't show "Won" and "Lost" in the kanban board to keep it clean, 
  // or we show them as separate sections. Here we show all but maybe filter some.
  const activeStages = stages.filter(s => !["won", "lost"].includes(s.key));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px] scrollbar-hide">
      {activeStages.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stage === stage.key);
        const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

        return (
          <div key={stage.key} className="flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{stage.label}</h3>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-bold">
                  {stageDeals.length}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-600">${stageValue.toLocaleString()}</span>
            </div>

            <div className="space-y-3 p-2 rounded-xl bg-muted/30 border border-dashed min-h-[500px]">
              {stageDeals.map((deal) => (
                <div
                  key={deal._id}
                  onClick={() => onEdit(deal)}
                  className="group bg-card border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                >
                  <h4 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {deal.title}
                  </h4>
                  <p className="text-base font-black text-emerald-600 mb-3">
                    ${deal.value.toLocaleString()}
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                      <div className="p-1 bg-muted rounded">
                        <User className="h-3 w-3" />
                      </div>
                      <span className="truncate">{deal.contactName}</span>
                    </div>
                    {deal.company && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                        <div className="p-1 bg-muted rounded">
                          <Building className="h-3 w-3" />
                        </div>
                        <span className="truncate">{deal.company}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t">
                    <span className="text-[10px] font-black">{deal.probability}%</span>
                    <div className="w-24 bg-muted rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-500"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {stageDeals.length === 0 && (
                <div className="flex items-center justify-center h-40 text-muted-foreground/40 text-xs font-medium uppercase italic">
                  Drop Here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
