"use client";


import { useState } from "react";

import {
  Plus,
  Download,
  Users,
  TrendingUp,
  DollarSign,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeals, type Deal } from "@/features/deals";
import { DEAL_STAGES } from "@/features/deals/constants/deatstage";
import { DealDialog } from "@/features/deals/components/DealDialog";
import type { CreateDealRequest } from "@/features/deals/services/deal-client-service";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth/auth-client";
import {
  PageHeader,
  MetricCard,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  AuthRequired,
  ConfirmDialog,
} from "@/components/common";

// Extracted Subcomponents
import { LeadFilters } from "./LeadFilters";
import { LeadTableView } from "./LeadTableView";
import { LeadCardView } from "./LeadCardView";
import { LeadDetailDrawer } from "./LeadDetailDrawer";

// Static options for sources & priorities
const SOURCES = [
  "Cold Outreach",
  "Event",
  "Social",
  "Website",
  "Referral",
  "Other",
];
const PRIORITIES = ["low", "medium", "high"];

export function LeadsView() {
  const { status } = useSession();

  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sortField, setSortField] = useState<"title" | "value" | "createdAt">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Layout View Mode (Table vs Card/Grid)
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Selection state for Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id?: string; bulk?: boolean } | null>(null);

  // Dialog & Drawer state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedLead, setSelectedLead] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // AI Summary & Email states
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  const [aiEmail, setAiEmail] = useState<any>(null);
  const [aiEmailLoading, setAiEmailLoading] = useState(false);
  const [emailPurpose, setEmailPurpose] = useState("Follow-up");
  const [emailTone, setEmailTone] = useState("Professional");

  // Fetch leads (reusing useDeals hook but fetching larger limit to support client-side filtering/sorting)
  const {
    deals: rawDeals,
    loading,
    error,
    createDeal,
    updateDeal,
    deleteDeal,
    refetch,
  } = useDeals({
    limit: 200,
  });

  const handleOpenDialog = (deal: Deal | null = null) => {
    setEditingDeal(deal);
    setDialogOpen(true);
  };

  const handleOpenDrawer = (lead: Deal) => {
    setSelectedLead(lead);
    setAiSummary(null);
    setAiEmail(null);
    setDrawerOpen(true);
  };

  const handleSubmit = async (data: CreateDealRequest) => {
    try {
      if (editingDeal) {
        await updateDeal(editingDeal._id, data);
        toast.success("Lead updated successfully");
        if (selectedLead && selectedLead._id === editingDeal._id) {
          // Update selected lead inside drawer too
          setSelectedLead({ ...selectedLead, ...data } as Deal);
        }
      } else {
        await createDeal(data);
        toast.success("Lead created successfully");
      }
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save lead");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget({ id });
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget({ bulk: true });
  };

  // AI Summary Trigger
  const generateSummary = async () => {
    if (!selectedLead) return;
    setAiSummaryLoading(true);
    try {
      const res = await fetch("/api/ai/lead-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: selectedLead._id }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate summary");
      }
      const data = await res.json();
      setAiSummary(data.summary);
      toast.success("AI Analysis Completed");
    } catch (err: any) {
      toast.error(err.message || "AI summary generation failed");
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // AI Email Trigger
  const generateEmail = async () => {
    if (!selectedLead) return;
    setAiEmailLoading(true);
    try {
      const res = await fetch("/api/ai/email-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: selectedLead._id,
          purpose: emailPurpose,
          tone: emailTone,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate email");
      }
      const data = await res.json();
      setAiEmail(data.email);
      toast.success("AI Email Draft Generated");
    } catch (err: any) {
      if (err instanceof Error && err.message.includes("quota")) {
        toast.error(err.message);
      } else {
        toast.error(err.message || "Email generation failed");
      }
    } finally {
      setAiEmailLoading(false);
    }
  };

  // Filter Local Logic
  const filteredLeads = rawDeals.filter((lead) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      lead.title.toLowerCase().includes(term) ||
      (lead.contactName && lead.contactName.toLowerCase().includes(term)) ||
      (lead.company && lead.company.toLowerCase().includes(term));

    const matchesStage =
      selectedStage === "all" || lead.stage === selectedStage;
    const matchesPriority =
      selectedPriority === "all" || lead.priority === selectedPriority;

    const leadSource =
      lead.tags && lead.tags.length > 0 ? lead.tags[0] : "Other";
    const matchesSource =
      selectedSource === "all" || leadSource === selectedSource;

    return matchesSearch && matchesStage && matchesPriority && matchesSource;
  });

  // Sort Local Logic
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === "value") {
      aVal = Number(aVal || 0);
      bVal = Number(bVal || 0);
    } else {
      aVal = String(aVal || "").toLowerCase();
      bVal = String(bVal || "").toLowerCase();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: "title" | "value" | "createdAt") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Selection toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedLeads.map((l) => l._id));
    }
  };

  // CSV Export
  const exportCSV = () => {
    if (sortedLeads.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "Title",
      "Value",
      "Stage",
      "Priority",
      "Source",
      "Contact Name",
      "Company",
      "Expected Close Date",
      "Created Date",
    ];
    const rows = sortedLeads.map((lead) => {
      const source = lead.tags && lead.tags.length > 0 ? lead.tags[0] : "Other";
      return [
        `"${lead.title.replace(/"/g, '""')}"`,
        lead.value,
        lead.stage,
        lead.priority,
        source,
        `"${(lead.contactName || "").replace(/"/g, '""')}"`,
        `"${(lead.company || "").replace(/"/g, '""')}"`,
        lead.expectedCloseDate
          ? new Date(lead.expectedCloseDate).toISOString().split("T")[0]
          : "TBD",
        new Date(lead.createdAt).toISOString().split("T")[0],
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `crm_leads_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export Triggered");
  };

  if (status === "loading" || (loading && rawDeals.length === 0)) {
    return <LoadingSkeleton type="page" />;
  }

  if (status === "unauthenticated") {
    return <AuthRequired description="Please log in to manage your leads." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Leads"
        message={error}
        onRetry={refetch}
      />
    );
  }

  // Calculate Metrics
  const totalLeads = rawDeals.length;
  const openPipelineValue = rawDeals
    .filter((d) => !["won", "lost"].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);
  const wonValue = rawDeals
    .filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + d.value, 0);
  const avgDealSize =
    totalLeads > 0
      ? Math.round(rawDeals.reduce((sum, d) => sum + d.value, 0) / totalLeads)
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Header */}
      <PageHeader
        title="Leads"
        description="Track and qualify every opportunity."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={exportCSV}
              className="rounded-full"
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button
              onClick={() => handleOpenDialog()}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" /> Add lead
            </Button>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total leads"
          value={totalLeads}
          subtitle="All time"
          icon={Users}
          accent="blue"
        />
        <MetricCard
          label="Open pipeline"
          value={`$${(openPipelineValue / 1000000).toFixed(1)}M`}
          subtitle="Active opportunities"
          icon={TrendingUp}
          accent="emerald"
        />
        <MetricCard
          label="Won value"
          value={`$${(wonValue / 1000).toFixed(0)}K`}
          subtitle="Completed revenue"
          icon={Award}
          accent="amber"
        />
        <MetricCard
          label="Avg deal size"
          value={`$${(avgDealSize / 1000).toFixed(1)}K`}
          subtitle="Average value"
          icon={DollarSign}
          accent="purple"
        />
      </div>

      {/* Filters and Controls */}
      <LeadFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        selectedIds={selectedIds}
        handleBulkDelete={handleBulkDelete}
        sortedLeadsLength={sortedLeads.length}
        totalLeads={totalLeads}
        rawDeals={rawDeals}
        DEAL_STAGES={DEAL_STAGES}
        PRIORITIES={PRIORITIES}
        SOURCES={SOURCES}
      />

      {/* Main Content Area */}
      {sortedLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description="Try adjusting your filters or search terms, or create a new lead to start building your pipeline."
          action={{
            label: "Add Lead",
            onClick: () => handleOpenDialog(),
            icon: Plus,
          }}
        />
      ) : viewMode === "table" ? (
        <LeadTableView
          sortedLeads={sortedLeads}
          selectedIds={selectedIds}
          toggleSelectAll={toggleSelectAll}
          toggleSelect={toggleSelect}
          toggleSort={toggleSort}
          handleOpenDrawer={handleOpenDrawer}
          handleOpenDialog={handleOpenDialog}
          handleDelete={handleDelete}
          DEAL_STAGES={DEAL_STAGES}
        />
      ) : (
        <LeadCardView
          sortedLeads={sortedLeads}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
          handleOpenDrawer={handleOpenDrawer}
          DEAL_STAGES={DEAL_STAGES}
        />
      )}

      {/* Add/Edit Lead Dialog */}
      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingDeal}
      />

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        selectedLead={selectedLead}
        handleOpenDialog={handleOpenDialog}
        handleDelete={handleDelete}
        DEAL_STAGES={DEAL_STAGES}
        aiSummary={aiSummary}
        setAiSummary={setAiSummary}
        aiSummaryLoading={aiSummaryLoading}
        generateSummary={generateSummary}
        aiEmail={aiEmail}
        setAiEmail={setAiEmail}
        aiEmailLoading={aiEmailLoading}
        generateEmail={generateEmail}
        emailPurpose={emailPurpose}
        setEmailPurpose={setEmailPurpose}
        emailTone={emailTone}
        setEmailTone={setEmailTone}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget?.bulk ? "Delete Selected Leads" : "Delete Lead"}
        description={
          deleteTarget?.bulk
            ? `Are you sure you want to delete ${selectedIds.length} selected leads? This action cannot be undone.`
            : "Are you sure you want to delete this lead? This action cannot be undone."
        }
        confirmText="Delete"
        onConfirm={async () => {
          if (deleteTarget?.bulk) {
            try {
              await Promise.all(
                selectedIds.map((id) =>
                  fetch(`/api/deals/${id}`, { method: "DELETE" }),
                ),
              );
              toast.success("Selected leads deleted successfully");
              setSelectedIds([]);
              refetch();
            } catch {
              toast.error("Failed to delete some leads");
            }
          } else if (deleteTarget?.id) {
            try {
              await deleteDeal(deleteTarget.id);
              toast.success("Lead deleted successfully");
              if (selectedLead?._id === deleteTarget.id) {
                setDrawerOpen(false);
              }
              refetch();
            } catch (err: any) {
              toast.error(err.message || "Failed to delete lead");
            }
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default LeadsView;
