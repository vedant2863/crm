"use client";

import { useDashboardPipeline } from "../../hooks/useDashboardPipeline";
import DealPipelineCard from "../shared/DealPipelineCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function PipelineWidget() {
    const { pipelineStats, loading, error } = useDashboardPipeline();

    if (loading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (error) {
        return (
            <div className="h-[400px] flex items-center justify-center border rounded-xl bg-destructive/10 text-destructive">
                Failed to load Pipeline
            </div>
        );
    }

    const totalDeals = pipelineStats.reduce((sum, item) => sum + item.count, 0);
    // Assuming value is not in the stat yet or we need to calculate it. 
    // The hook returns { stage, count, value } but I only saw count in previous code?
    // Previous code had `totalPipelineValue` passed from main stats.
    // The new hook interface has `value`.
    const totalValue = pipelineStats.reduce((sum, item) => sum + (item.value || 0), 0);

    return (
        <DealPipelineCard
            chartData={pipelineStats}
            totalPipelineDeals={totalDeals}
            totalPipelineValue={totalValue}
        />
    );
}
