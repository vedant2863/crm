"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeals } from "../hooks/useDeals";
import type { Deal } from "../types/deal";
import { DEAL_STAGES } from "../constants/deatstage";
import PipelineBoard from "./PipelineBoard";
import { DealDialog } from "./DealDialog";
import type { CreateDealRequest } from "../services/deal-client-service";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  ViewToggle,
  LoadingSkeleton,
  AuthRequired,
  ErrorState,
  ConfirmDialog,
  StatusBadge,
} from "@/components/common";

export function PipelineView() {
  const { status } = useSession();
  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deleteDealId, setDeleteDealId] = useState<string | null>(null);

  const { deals, loading, error, isConnected, createDeal, updateDeal, deleteDeal, refetch } = useDeals({
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
    try {
      await deleteDeal(dealId);
      toast.success("Lead deleted");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lead");
    }
  };

  if (status === "loading" || (loading && deals.length === 0)) {
    return <LoadingSkeleton type="page" />;
  }

  if (status === "unauthenticated") {
    return <AuthRequired description="Please log in to manage your sales pipeline." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Pipeline"
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Sales Pipeline"
        description="Drag and drop leads to advance stages with real-time multi-tenant collaboration."
        badge={
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-300 shadow-sm",
              isConnected
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              )}
            />
            <span>{isConnected ? "Live Realtime Sync" : "Reconnecting..."}</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <ViewToggle<"board" | "table">
              mode={viewMode}
              onChange={setViewMode}
              options={[
                { value: "board", label: "Board" },
                { value: "table", label: "Table" },
              ]}
            />
            <Button
              onClick={() => handleOpenDialog()}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" /> Add lead
            </Button>
          </div>
        }
      />

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
                  <th className="p-4">Title</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Company</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {deals.map((deal) => {
                  return (
                    <tr
                      key={deal._id}
                      className="hover:bg-muted/15 transition-colors group/row cursor-pointer"
                      onClick={() => handleOpenDialog(deal)}
                    >
                      <td className="p-4 font-bold text-foreground group-hover/row:text-primary transition-colors">
                        {deal.title}
                      </td>
                      <td className="p-4 font-black">
                        ${deal.value.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={deal.stage} />
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {deal.contactName || "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {deal.company || "—"}
                      </td>
                      <td
                        className="p-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={deal.stage}
                            onChange={(e) =>
                              handleMoveStage(deal._id, e.target.value)
                            }
                            className="text-xs bg-background border rounded px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {DEAL_STAGES.map((s) => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ))}
                          </select>
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
                            onClick={() => setDeleteDealId(deal._id)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDealId}
        onOpenChange={(open) => !open && setDeleteDealId(null)}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          if (deleteDealId) {
            await handleDelete(deleteDealId);
            setDeleteDealId(null);
          }
        }}
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

export default PipelineView;
