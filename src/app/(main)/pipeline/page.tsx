"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useState } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { Plus, Target, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeals, Deal } from "@/features/deals";
import { DEAL_STAGES } from "@/features/deals/constants/deatstage";
import PipelineBoard from "@/features/deals/components/PipelineBoard";
import { DealDialog } from "@/features/deals/components/DealDialog";
import { CreateDealRequest } from "@/features/deals/services/deal-client-service";
import toast from "react-hot-toast";

export default function PipelinePage() {
  const { status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    refetch,
  } = useDeals({
    limit: 200, // Fetch all deals for Kanban layout
  });

  const handleOpenDialog = (deal: Deal | null = null) => {
    setEditingDeal(deal);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateDealRequest) => {
    try {
      if (editingDeal) {
        await updateDeal(editingDeal._id, data);
        toast.success("Lead updated");
      } else {
        await createDeal(data);
        toast.success("Lead created");
      }
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save lead");
    }
  };

  const handleMoveStage = async (dealId: string, nextStage: string) => {
    try {
      await updateDeal(dealId, { stage: nextStage });
      const stageLabel = DEAL_STAGES.find(s => s.key === nextStage)?.label || nextStage;
      toast.success(`Moved to ${stageLabel}`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to move lead");
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to manage your sales pipeline.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Error Loading Pipeline</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">Drag and drop leads to advance stages.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </Button>
      </div>

      <PipelineBoard
        stages={DEAL_STAGES}
        deals={deals}
        onEdit={handleOpenDialog}
        onMoveStage={handleMoveStage}
      />

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingDeal}
      />
    </div>
  );
}
