"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Target,
  Plus,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import StatsCard from "@/feature/deals/components/StatsCard";
import AddDealForm from "@/feature/deals/components/AddDealForm";
import { Deal } from "@/feature/deals/types/deal";
import PipelineBoard from "@/feature/deals/components/PipelineBoard";
import DealList from "@/feature/deals/components/DealList";
import DealFilters from "@/feature/deals/components/DealFilterSearch";
import { DEAL_STAGES } from "@/feature/deals/constants/deatstage";
import { useDeals } from "@/hooks/useDeals";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";


export default function DealsPage() {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    deleteDeal,
    refetch,
  } = useDeals({
    search: searchTerm,
    stage: selectedStage,
    limit: 100, // Get more deals for better filtering
  });

  const handleAddDeal = async (dealData: any) => {
    try {
      await createDeal(dealData);
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create deal:", err);
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage =
      selectedStage === "all" || deal.stage === selectedStage;

    return matchesSearch && matchesStage;
  });


  const getStageColor = (stage: string) => {
    const stageConfig = DEAL_STAGES.find((s) => s.key === stage);
    return stageConfig?.color || "bg-gray-100 text-gray-800";
  };

  const getTotalValue = (stage?: string) => {
    const relevantDeals = stage
      ? deals.filter((d) => d.stage === stage)
      : deals;
    return relevantDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const getWeightedValue = () => {
    return deals.reduce(
      (sum, deal) => sum + (deal.value * deal.probability) / 100,
      0
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Deal List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">
            You need to be logged in to access deals.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Deals</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-2">
            Manage your sales pipeline and track deal progress
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("pipeline")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "pipeline"
                  ? "bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pipeline View
            </button>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Pipeline"
          value={getTotalValue()}
          icon={<DollarSign className="h-8 w-8 text-green-600" />}
        />
        <StatsCard
          label="Weighted Pipeline"
          value={getWeightedValue()}
          valueColor="text-blue-600"
          icon={<TrendingUp className="h-8 w-8 text-blue-600" />}
        />
        <StatsCard
          label="Active Deals"
          value={deals.filter((d) => !["won", "lost"].includes(d.stage)).length}
          icon={<Target className="h-8 w-8 text-purple-600" />}
        />
        <StatsCard
          label="Won This Month"
          value={getTotalValue("won")}
          valueColor="text-green-600"
          bgColor="bg-green-100"
          dotColor="bg-green-600"
        />
      </div>

      {/* Search and Filter */}
      <DealFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        stages={DEAL_STAGES}
      />

      {/* Add Deal Form */}
      {showAddForm && (
        <>
        <AddDealForm
          onAdd={handleAddDeal}
          onCancel={() => setShowAddForm(false)}
          />
          </>
      )}

      {/* Pipeline View */}
      {viewMode === "pipeline" && (
        <PipelineBoard stages={DEAL_STAGES} deals={filteredDeals} />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <DealList
          stages={DEAL_STAGES}
          getStageColor={getStageColor}
          deals={filteredDeals}
          onUpdateDeal={updateDeal}
          onDeleteDeal={deleteDeal}
        />
      )}
    </div>
  );
}
