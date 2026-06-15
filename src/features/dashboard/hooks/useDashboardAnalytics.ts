"use client";

import { useState, useEffect, useCallback } from "react";

export interface ForecastItem {
  month: string;
  revenue: number;
  dealsCount: number;
}

export interface StageItem {
  stage: string;
  value: number;
  count: number;
}

export interface DistributionItem {
  name: string;
  value: number;
}

export interface AnalyticsData {
  forecastData: ForecastItem[];
  stageData: StageItem[];
  taskData: {
    priorityData: DistributionItem[];
    statusData: DistributionItem[];
  };
}

export function useDashboardAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refresh: fetchAnalytics };
}
