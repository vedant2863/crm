"use client";

import { useState, useEffect, useCallback } from "react";

interface Activity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
}

export function useDashboardActivities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/dashboard/recent-activities");
            if (!res.ok) throw new Error("Failed to fetch activities");
            const data = await res.json();
            setActivities(data.recentActivities ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    return { activities, loading, error, refresh: fetchActivities };
}
