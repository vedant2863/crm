"use client";

import { useState, useEffect, useCallback } from "react";

import {
  dealService,
  DealsResponse,
  CreateDealRequest,
} from "@/features/deals/services/deal-client-service";
import { Deal } from "@/features/deals/types/deal";
import { useSession } from "@/lib/auth/auth-client";
import { useDealSocket } from "./useDealSocket";

export interface UseDealsOptions {
  search?: string;
  stage?: string;
  page?: number;
  limit?: number;
  realtime?: boolean;
  showToasts?: boolean;
}

export function useDeals(options: UseDealsOptions = {}) {
  const { status } = useSession();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const { isConnected } = useDealSocket({
    showToasts: options.showToasts ?? true,
    onDealCreated: (newDeal) => {
      setDeals((prev) => {
        if (prev.some((d) => d._id === newDeal._id)) return prev;
        return [newDeal, ...prev];
      });
    },
    onDealUpdated: (updatedDeal) => {
      setDeals((prev) =>
        prev.map((d) => (d._id === updatedDeal._id ? { ...d, ...updatedDeal } : d))
      );
    },
    onDealDeleted: (deletedDealId) => {
      setDeals((prev) => prev.filter((d) => d._id !== deletedDealId));
    },
  });

  const fetchDeals = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      setLoading(true);
      setError(null);

      const response: DealsResponse = await dealService.getDeals({
        search: options.search,
        stage: options.stage,
        page: options.page || 1,
        limit: options.limit || 10,
      });

      setDeals(response.deals);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch deals";
      setError(errorMessage);
      console.error("Error fetching deals:", err);
    } finally {
      setLoading(false);
    }
  }, [status, options.search, options.stage, options.page, options.limit]);

  const createDeal = useCallback(async (dealData: CreateDealRequest) => {
    try {
      const response = await dealService.createDeal(dealData);
      setDeals((prev) => [response.deal, ...prev]);
      return response.deal;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create deal";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateDeal = useCallback(
    async (id: string, dealData: Partial<CreateDealRequest>) => {
      try {
        const response = await dealService.updateDeal(id, dealData);
        setDeals((prev) =>
          prev.map((deal) => (deal._id === id ? response.deal : deal)),
        );
        return response.deal;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update deal";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const deleteDeal = useCallback(async (id: string) => {
    try {
      await dealService.deleteDeal(id);
      setDeals((prev) => prev.filter((deal) => deal._id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete deal";
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const refetch = useCallback(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    pagination,
    isConnected,
    createDeal,
    updateDeal,
    deleteDeal,
    refetch,
  };
}
