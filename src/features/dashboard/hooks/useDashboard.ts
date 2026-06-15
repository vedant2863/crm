"use client";

import { useState, useEffect, useCallback } from "react";

export interface DashboardStats {
  totalContacts: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  pipelineStats: Array<{ stage: string; count: number; value: number }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  taskStats: Record<string, number>;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalDeals: 0,
    totalRevenue: 0,
    conversionRate: 0,
    pipelineStats: [],
    recentActivities: [],
    taskStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel fetch to multiple endpoints
      const [kpis, pipeline, recent, tasks] = await Promise.all([
        fetch("/api/dashboard/kpis").then((r) => r.json()),
        fetch("/api/dashboard/pipeline").then((r) => r.json()),
        fetch("/api/dashboard/recent-activities").then((r) => r.json()),
        fetch("/api/dashboard/tasks-stats").then((r) => r.json()),
      ]);

      setStats({
        totalContacts: kpis.totalContacts ?? 0,
        totalDeals: kpis.totalDeals ?? 0,
        totalRevenue: kpis.totalRevenue ?? 0,
        conversionRate: kpis.conversionRate ?? 0,
        pipelineStats: pipeline.pipelineStats ?? [],
        recentActivities: recent.recentActivities ?? [],
        taskStats: tasks.taskStats ?? {},
      });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { stats, loading, error, refresh: fetchAll };
}
