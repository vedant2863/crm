"use client";

import { useState } from "react";
import { User, Building } from "lucide-react";
import { Deal } from "../types/deal";

interface Stage {
  key: string;
  label: string;
}

interface PipelineBoardProps {
  stages: Stage[];
  deals: Deal[];
  onEdit: (deal: Deal) => void;
  onMoveStage: (dealId: string, nextStage: string) => void;
}

export default function PipelineBoard({ stages, deals, onEdit, onMoveStage }: PipelineBoardProps) {
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // We usually don't show "Won" and "Lost" in the kanban board to keep it clean, 
  // or we show them as separate sections. Here we show all but maybe filter some.
  const activeStages = stages;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px] scrollbar-hide">
      {activeStages.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stage === stage.key);
        const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
        const isDraggedOver = dragOverStage === stage.key;

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

            <div
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setDragOverStage(stage.key)}
              onDragLeave={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
                  setDragOverStage(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStage(null);
                const dealId = e.dataTransfer.getData("text/plain");
                if (dealId) {
                  onMoveStage(dealId, stage.key);
                }
              }}
              className={`space-y-3 p-3 rounded-2xl border border-dashed min-h-[500px] transition-all duration-300 ${
                isDraggedOver
                  ? "bg-primary/10 border-primary/40 scale-[1.01]"
                  : "bg-muted/30 border-muted-foreground/20"
              }`}
            >
              {stageDeals.map((deal) => (
                <div
                  key={deal._id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", deal._id);
                    e.dataTransfer.effectAllowed = "move";
                    setIsDragging(true);
                  }}
                  onDragEnd={() => {
                    setTimeout(() => setIsDragging(false), 50);
                  }}
                  onClick={() => {
                    if (!isDragging) {
                      onEdit(deal);
                    }
                  }}
                  className="group bg-card border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer active:opacity-50"
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
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate">{deal.contactName}</span>
                    </div>
                    {deal.company && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                        <div className="p-1 bg-muted rounded">
                          <Building className="h-3.5 w-3.5" />
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
                <div className="flex items-center justify-center h-40 text-muted-foreground/30 text-xs font-bold uppercase tracking-wider italic">
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
