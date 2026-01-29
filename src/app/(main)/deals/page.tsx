"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Target, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeals } from "@/hooks/useDeals";
import { DEAL_STAGES } from "@/feature/deals/constants/deatstage";
import { DealStats } from "@/feature/deals/components/DealStats";
import { DealFilters } from "@/feature/deals/components/DealFilters";
import { DealItem } from "@/feature/deals/components/DealItem";
import { DealDialog } from "@/feature/deals/components/DealDialog";
import PipelineBoard from "@/feature/deals/components/PipelineBoard";
import { Deal } from "@/feature/deals/types/deal";
import { CreateDealRequest } from "@/feature/deals/services/dealService";
import toast from "react-hot-toast";

export default function DealsPage() {
  const { status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

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
    limit: 100,
  });

  const handleOpenDialog = (deal: Deal | null = null) => {
    setEditingDeal(deal);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateDealRequest) => {
    try {
      if (editingDeal) {
        await updateDeal(editingDeal._id, data);
        toast.success("Deal updated");
      } else {
        await createDeal(data);
        toast.success("Deal created");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
      toast.error("Failed to save deal");
    }
  };

  const handleAdvance = async (deal: Deal) => {
    const currentIndex = DEAL_STAGES.findIndex(s => s.key === deal.stage);
    if (currentIndex < DEAL_STAGES.length - 1) {
      const nextStage = DEAL_STAGES[currentIndex + 1].key;
      try {
        await updateDeal(deal._id, { stage: nextStage });
        toast.success(`Advanced to ${DEAL_STAGES[currentIndex + 1].label}`);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message)
        }
        toast.error("Failed to advance stage");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        await deleteDeal(id);
        toast.success("Deal deleted");
      } catch (err) {
        if (err instanceof Error) console.error(err.message)

        toast.error("Failed to delete deal");
      }
    }
  };

  if (status === "loading" || (loading && deals.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to manage your deals.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Error Loading Deals</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = deals.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0);
  const activeDeals = deals.filter(d => !["won", "lost"].includes(d.stage)).length;
  const wonValue = deals.filter(d => d.stage === "won").reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground mt-1">Manage your sales pipeline and track deal progress.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4 mr-2" /> Add Deal
        </Button>
      </div>

      <DealStats
        totalValue={totalValue}
        weightedValue={weightedValue}
        activeDeals={activeDeals}
        wonValue={wonValue}
      />

      <DealFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        stages={DEAL_STAGES}
      />

      {viewMode === "pipeline" ? (
        <PipelineBoard stages={DEAL_STAGES} deals={deals} onEdit={handleOpenDialog} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {deals.map((deal) => (
            <DealItem
              key={deal._id}
              deal={deal}
              stages={DEAL_STAGES}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              onAdvance={handleAdvance}
            />
          ))}

          {deals.length === 0 && (
            <div className="text-center py-20 bg-card border rounded-2xl border-dashed">
              <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No deals found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or add a new deal.</p>
            </div>
          )}
        </div>
      )}

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingDeal}
      />
    </div>
  );
}

