"use client";

import { Deal } from "../types/deal";
import { User, Building, Calendar, DollarSign, TrendingUp, MoreHorizontal, Edit, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface DealItemProps {
    deal: Deal;
    stages: any[];
    onEdit: (deal: Deal) => void;
    onDelete: (id: string) => void;
    onAdvance: (deal: Deal) => void;
}

export function DealItem({ deal, stages, onEdit, onDelete, onAdvance }: DealItemProps) {
    const currentStage = stages.find(s => s.key === deal.stage);
    const nextStageIndex = stages.findIndex(s => s.key === deal.stage) + 1;
    const nextStage = nextStageIndex < stages.length ? stages[nextStageIndex] : null;

    return (
        <div className="group relative bg-card border rounded-xl p-5 transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-bold truncate">
                            {deal.title}
                        </h3>
                        <Badge variant="secondary" className={`text-[10px] uppercase tracking-wider font-bold border-none ${currentStage?.color || ""}`}>
                            {currentStage?.label || deal.stage}
                        </Badge>
                        <span className="text-lg font-black text-emerald-600 ml-auto">
                            ${deal.value.toLocaleString()}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-muted rounded-md">
                                <Building className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate">{deal.contactName} at {deal.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-muted rounded-md">
                                <Calendar className="h-3.5 w-3.5" />
                            </div>
                            <span>Close: {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "TBD"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-muted rounded-md">
                                <TrendingUp className="h-3.5 w-3.5" />
                            </div>
                            <span>{deal.probability}% Probability</span>
                        </div>
                    </div>

                    {deal.notes && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-1 italic">
                            "{deal.notes}"
                        </p>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t text-[10px] uppercase font-bold text-muted-foreground/60">
                        <span>Created {new Date(deal.createdAt).toLocaleDateString()}</span>
                        {deal.lastActivity && <span>Last Activity {new Date(deal.lastActivity).toLocaleDateString()}</span>}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {nextStage && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-[10px] uppercase font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100 hover:border-blue-200"
                            onClick={() => onAdvance(deal)}
                        >
                            Move to {nextStage.label} <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                    )}
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onEdit(deal)}>
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(deal._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
