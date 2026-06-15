"use client";

import { DollarSign, TrendingUp, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DealStatsProps {
    totalValue: number;
    weightedValue: number;
    activeDeals: number;
    wonValue: number;
}

export function DealStats({ totalValue, weightedValue, activeDeals, wonValue }: DealStatsProps) {
    const stats = [
        { label: "Total Pipeline", value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
        { label: "Weighted Value", value: `$${weightedValue.toLocaleString()}`, icon: TrendingUp, color: "text-blue-500", bgColor: "bg-blue-500/10 border-blue-500/20" },
        { label: "Active Deals", value: activeDeals.toString(), icon: Target, color: "text-indigo-500", bgColor: "bg-indigo-500/10 border-indigo-500/20" },
        { label: "Won This Month", value: `$${wonValue.toLocaleString()}`, icon: Trophy, color: "text-amber-500", bgColor: "bg-amber-500/10 border-amber-500/20" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                                <p className={cn("text-3xl font-black tracking-tight", stat.color)}>{stat.value}</p>
                            </div>
                            <div className={cn("p-3 rounded-2xl border shrink-0", stat.bgColor)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
