"use client";

import { useState, useEffect, useCallback } from "react";

export interface DashboardKpiStats {
    totalContacts: number;
    totalDeals: number;
    totalRevenue: number;
    conversionRate: number;
}

export function useDashboardKpis() {
    const [stats, setStats] = useState<DashboardKpiStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchKpis = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/dashboard/kpis");
            if (!res.ok) throw new Error("Failed to fetch KPIs");
            const data = await res.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKpis();
    }, [fetchKpis]);

    return { stats, loading, error, refresh: fetchKpis };
}
