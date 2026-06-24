"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth/auth-client";
import toast from "react-hot-toast";

export function useDashboardState() {
  const { data: session, status } = useSession();

  // Dashboard Aggregation States
  const [dbData, setDbData] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // AI Sales Insights States
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNoKey, setAiNoKey] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [aiRefreshCount, setAiRefreshCount] = useState(0);
  const AI_REFRESH_LIMIT = 5;

  // UI state toggles
  const [engagementPeriod, setEngagementPeriod] = useState<"Monthly" | "Annually">("Monthly");

  // Fetch Dashboard Database Aggregations
  const fetchDashboardData = useCallback(async () => {
    try {
      setDbLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const data = await res.json();
      setDbData(data);
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setDbLoading(false);
    }
  }, []);

  // Fetch AI Insights
  const fetchAiInsights = useCallback(async (force = false) => {
    setAiLoading(true);
    try {
      const url = force ? "/api/ai/sales-insights?force=true" : "/api/ai/sales-insights";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to generate AI insights");
      const data = await res.json();
      const providerName = data.provider === "Gemini (with Groq Fallback)" ? null : data.provider;
      if (data.provider) setAiProvider(providerName);
      
      if (data.remaining !== undefined) {
        setAiRefreshCount(AI_REFRESH_LIMIT - data.remaining);
      }

      if (data.noApiKey) {
        setAiNoKey(true);
        setAiError(false);
        setAiInsights(null);
      } else if (data.aiError) {
        setAiError(true);
        setAiNoKey(false);
        setAiInsights(null);
        if (force) toast.error("AI service temporarily unavailable.");
      } else {
        setAiNoKey(false);
        setAiError(false);
        setAiInsights(data.insights);
        if (force) {
          toast.success(`AI Insights Refreshed via ${providerName ?? "AI"}`);
        }
      }
    } catch (err: any) {
      console.error("AI Insights Error:", err);
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
      fetchAiInsights();
    }
  }, [status, fetchDashboardData, fetchAiInsights]);

  const handleRefreshAll = () => {
    fetchDashboardData();
    fetchAiInsights(true);
  };

  return {
    session,
    status,
    dbData,
    dbLoading,
    dbError,
    aiInsights,
    aiLoading,
    aiNoKey,
    aiError,
    aiProvider,
    aiRefreshCount,
    AI_REFRESH_LIMIT,
    engagementPeriod,
    setEngagementPeriod,
    fetchDashboardData,
    fetchAiInsights,
    handleRefreshAll,
  };
}
