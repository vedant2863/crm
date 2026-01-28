"use client";

import { useState, useEffect, useCallback } from "react";

interface PipelineStat {
    stage: string;
    count: number;
    value: number;
}

export function useDashboardPipeline() {
    const [pipelineStats, setPipelineStats] = useState<PipelineStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPipeline = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/dashboard/pipeline");
            if (!res.ok) throw new Error("Failed to fetch pipeline");
            const data = await res.json();
            setPipelineStats(data.pipelineStats ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPipeline();
    }, [fetchPipeline]);

    return { pipelineStats, loading, error, refresh: fetchPipeline };
}
