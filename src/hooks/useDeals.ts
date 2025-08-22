import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { dealService, DealsResponse, CreateDealRequest } from "@/feature/deals/services/dealService";
import { Deal } from "@/feature/deals/types/deal";

export interface UseDealsOptions {
  search?: string;
  stage?: string;
  page?: number;
  limit?: number;
}

export function useDeals(options: UseDealsOptions = {}) {
  const { data: session, status } = useSession();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
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
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch deals";
      setError(errorMessage);
      console.error("Error fetching deals:", err);
    } finally {
      setLoading(false);
    }
  }, [status, options.search, options.stage, options.page, options.limit]);

  const createDeal = useCallback(async (dealData: CreateDealRequest) => {
    try {
      const response = await dealService.createDeal(dealData);
      setDeals(prev => [response.deal, ...prev]);
      return response.deal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create deal";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateDeal = useCallback(async (id: string, dealData: Partial<CreateDealRequest>) => {
    try {
      const response = await dealService.updateDeal(id, dealData);
      setDeals(prev => prev.map(deal => 
        deal._id === id ? response.deal : deal
      ));
      return response.deal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update deal";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteDeal = useCallback(async (id: string) => {
    try {
      await dealService.deleteDeal(id);
      setDeals(prev => prev.filter(deal => deal._id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete deal";
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
    createDeal,
    updateDeal,
    deleteDeal,
    refetch,
  };
}
