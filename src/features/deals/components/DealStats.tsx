"use client";

import { DollarSign, TrendingUp, Target, Trophy } from "lucide-react";
import { MetricCard } from "@/components/common";

interface DealStatsProps {
    totalValue: number;
    weightedValue: number;
    activeDeals: number;
    wonValue: number;
}

export function DealStats({ totalValue, weightedValue, activeDeals, wonValue }: DealStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
                label="Total Pipeline"
                value={`$${totalValue.toLocaleString()}`}
                icon={DollarSign}
                accent="emerald"
            />
            <MetricCard
                label="Weighted Value"
                value={`$${weightedValue.toLocaleString()}`}
                icon={TrendingUp}
                accent="blue"
            />
            <MetricCard
                label="Active Deals"
                value={activeDeals}
                icon={Target}
                accent="primary"
            />
            <MetricCard
                label="Won This Month"
                value={`$${wonValue.toLocaleString()}`}
                icon={Trophy}
                accent="amber"
            />
        </div>
    );
}
