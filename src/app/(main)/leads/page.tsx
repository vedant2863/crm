"use client";


import { useState } from "react";

import {
  Plus,
  Download,
  AlertCircle,
  Users,
  TrendingUp,
  DollarSign,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeals, Deal } from "@/features/deals";
import { DEAL_STAGES } from "@/features/deals/constants/deatstage";
import { DealDialog } from "@/features/deals/components/DealDialog";
import { CreateDealRequest } from "@/features/deals/services/deal-client-service";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth/auth-client";

// Extracted Subcomponents
import { LeadKpiCard } from "./components/LeadKpiCard";
import { LeadFilters } from "./components/LeadFilters";
import { LeadTableView } from "./components/LeadTableView";
import { LeadCardView } from "./components/LeadCardView";
import { LeadDetailDrawer } from "./components/LeadDetailDrawer";

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

export default function LeadsPage() {
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteDeal(id);
      toast.success("Lead deleted successfully");
      if (selectedLead?._id === id) {
        setDrawerOpen(false);
      }
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lead");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete the ${selectedIds.length} selected leads?`,
      )
    )
      return;
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
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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
            Please log in to manage your leads.
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
          <h1 className="text-2xl font-bold">Error Loading Leads</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Track and qualify every opportunity.
          </p>
        </div>
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
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LeadKpiCard
          label="Total leads"
          value={totalLeads}
          subtitle="All time"
          icon={Users}
          accent="#3b82f6"
        />
        <LeadKpiCard
          label="Open pipeline"
          value={`$${(openPipelineValue / 1000000).toFixed(1)}M`}
          subtitle="Active opportunities"
          icon={TrendingUp}
          accent="#10b981"
        />
        <LeadKpiCard
          label="Won value"
          value={`$${(wonValue / 1000).toFixed(0)}K`}
          subtitle="Completed revenue"
          icon={Award}
          accent="#f59e0b"
        />
        <LeadKpiCard
          label="Avg deal size"
          value={`$${(avgDealSize / 1000).toFixed(1)}K`}
          subtitle="Average value"
          icon={DollarSign}
          accent="#8b5cf6"
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
      {viewMode === "table" ? (
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
    </div>
  );
}
