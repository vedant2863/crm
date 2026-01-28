"use client";

import { DollarSign, TrendingUp, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DealStatsProps {
    totalValue: number;
    weightedValue: number;
    activeDeals: number;
    wonValue: number;
}

export function DealStats({ totalValue, weightedValue, activeDeals, wonValue }: DealStatsProps) {
    const stats = [
        { label: "Total Pipeline", value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bgColor: "bg-emerald-50" },
        { label: "Weighted Value", value: `$${weightedValue.toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bgColor: "bg-blue-50" },
        { label: "Active Deals", value: activeDeals.toString(), icon: Target, color: "text-purple-600", bgColor: "bg-purple-50" },
        { label: "Won This Month", value: `$${wonValue.toLocaleString()}`, icon: Trophy, color: "text-amber-600", bgColor: "bg-amber-50" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
