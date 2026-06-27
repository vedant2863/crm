"use client";

import { useState } from "react";
import { Plus, AlertCircle, Table, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeals, Deal } from "@/features/deals";
import { DEAL_STAGES } from "@/features/deals/constants/deatstage";
import PipelineBoard from "@/features/deals/components/PipelineBoard";
import { DealDialog } from "@/features/deals/components/DealDialog";
import { CreateDealRequest } from "@/features/deals/services/deal-client-service";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

export default function PipelinePage() {
  const { status } = useSession();
  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const { deals, loading, error, createDeal, updateDeal, deleteDeal, refetch } = useDeals({
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
      const stageLabel =
        DEAL_STAGES.find((s) => s.key === nextStage)?.label || nextStage;
      toast.success(`Moved to ${stageLabel}`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to move lead");
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteDeal(dealId);
      toast.success("Lead deleted");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lead");
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
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">
            Please log in to manage your sales pipeline.
          </p>
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
          <p className="text-muted-foreground mt-1">
            Drag and drop leads to advance stages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border p-1 rounded-full bg-muted/30 shrink-0">
            <Button
              variant={viewMode === "board" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("board")}
              className="rounded-full h-8 w-8 p-0"
              title="Board View"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-full h-8 w-8 p-0"
              title="Table View"
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Lead
          </Button>
        </div>
      </div>

      {viewMode === "board" ? (
        <PipelineBoard
          stages={DEAL_STAGES}
          deals={deals}
          onEdit={handleOpenDialog}
          onMoveStage={handleMoveStage}
        />
      ) : (
        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-muted/20 font-bold uppercase tracking-wider text-muted-foreground/80">
                  <th className="p-4">Lead</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Expected Close Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-left">
                {deals.map((deal) => {
                  const stageObj = DEAL_STAGES.find((s) => s.key === deal.stage);
                  const initial = deal.contactName ? deal.contactName.charAt(0).toUpperCase() : "L";
                  return (
                    <tr key={deal._id} className="hover:bg-muted/15 transition-colors group/row">
                      <td className="p-4 font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground font-black truncate group-hover/row:text-primary transition-colors">{deal.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate">{deal.contactName} at {deal.company || "General"}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 font-bold">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stageObj?.color || "#94a3b8" }} />
                          {stageObj?.label || deal.stage}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase border",
                          deal.priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                            deal.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                              "bg-gray-500/10 text-gray-600 border-gray-500/20"
                        )}>
                          {deal.priority}
                        </span>
                      </td>
                      <td className="p-4 font-bold">
                        ${deal.value.toLocaleString()}
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">
                        {deal.expectedCloseDate
                          ? new Date(deal.expectedCloseDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "TBD"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(deal)}
                            className="hover:bg-primary/5 hover:text-primary border-border/50 h-7"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 hover:text-destructive h-7"
                            onClick={() => handleDelete(deal._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {deals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground font-medium">
                      No leads in pipeline
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
