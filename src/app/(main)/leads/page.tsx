"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Plus, Search, Download, Trash2, Edit, AlertCircle, 
  Table, Grid, Check, Sparkles, X, Copy, RefreshCw, 
  ExternalLink, Mail, ShieldAlert, ArrowUpDown, ChevronRight,
  TrendingUp, Users, DollarSign, Award, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDeals, Deal } from "@/features/deals";
import { DEAL_STAGES } from "@/features/deals/constants/deatstage";
import { DealDialog } from "@/features/deals/components/DealDialog";
import { CreateDealRequest } from "@/features/deals/services/deal-client-service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// Static options for sources & priorities
const SOURCES = ["Cold Outreach", "Event", "Social", "Website", "Referral", "Other"];
const PRIORITIES = ["low", "medium", "high"];

export default function LeadsPage() {
  const { status } = useSession();
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sortField, setSortField] = useState<"title" | "value" | "createdAt">("createdAt");
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
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected leads?`)) return;
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/deals/${id}`, { method: "DELETE" })));
      toast.success("Selected leads deleted successfully");
      setSelectedIds([]);
      refetch();
    } catch (err: any) {
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
      if (!res.ok) throw new Error("Failed to generate summary");
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
          tone: emailTone
        }),
      });
      if (!res.ok) throw new Error("Failed to generate email");
      const data = await res.json();
      setAiEmail(data.email);
      toast.success("AI Email Draft Generated");
    } catch (err: any) {
      toast.error(err.message || "Email generation failed");
    } finally {
      setAiEmailLoading(false);
    }
  };

  // Sort and Filter Logic locally
  const filteredLeads = rawDeals.filter(lead => {
    // Search Term
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      lead.title.toLowerCase().includes(term) ||
      (lead.contactName && lead.contactName.toLowerCase().includes(term)) ||
      (lead.company && lead.company.toLowerCase().includes(term));
    
    // Stage Filter
    const matchesStage = selectedStage === "all" || lead.stage === selectedStage;
    
    // Priority Filter
    const matchesPriority = selectedPriority === "all" || lead.priority === selectedPriority;
    
    // Source Filter
    // In our Deal model, source might be saved in tags or custom fields, or we use a fallback mapping.
    // Let's assume we map tags to sources or just match against a simulated property.
    // Since seedData has tags representing sources sometimes, or we can check tags.
    // Let's check tags:
    const leadSource = lead.tags && lead.tags.length > 0 ? lead.tags[0] : "Other";
    const matchesSource = selectedSource === "all" || leadSource === selectedSource;

    return matchesSearch && matchesStage && matchesPriority && matchesSource;
  });

  // Sort
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
      setSortOrder("desc"); // Default to desc on change
    }
  };

  // Selection toggle
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedLeads.map(l => l._id));
    }
  };

  // CSV Export
  const exportCSV = () => {
    if (sortedLeads.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Title", "Value", "Stage", "Priority", "Source", "Contact Name", "Company", "Expected Close Date", "Created Date"];
    const rows = sortedLeads.map(lead => {
      const source = lead.tags && lead.tags.length > 0 ? lead.tags[0] : "Other";
      return [
        `"${lead.title.replace(/"/g, '""')}"`,
        lead.value,
        lead.stage,
        lead.priority,
        source,
        `"${(lead.contactName || "").replace(/"/g, '""')}"`,
        `"${(lead.company || "").replace(/"/g, '""')}"`,
        lead.expectedCloseDate ? new Date(lead.expectedCloseDate).toISOString().split('T')[0] : "TBD",
        new Date(lead.createdAt).toISOString().split('T')[0]
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
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
          <p className="text-muted-foreground">Please log in to manage your leads.</p>
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
  const openPipelineValue = rawDeals.filter(d => !["won", "lost"].includes(d.stage)).reduce((sum, d) => sum + d.value, 0);
  const wonValue = rawDeals.filter(d => d.stage === "won").reduce((sum, d) => sum + d.value, 0);
  const avgDealSize = totalLeads > 0 ? Math.round(rawDeals.reduce((sum, d) => sum + d.value, 0) / totalLeads) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Track and qualify every opportunity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportCSV} className="rounded-full">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => handleOpenDialog()} className="shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4 mr-2" /> Add lead
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LeadKpiCard label="Total leads" value={totalLeads} subtitle="All time" icon={Users} accent="#3b82f6" />
        <LeadKpiCard label="Open pipeline" value={`$${(openPipelineValue / 1000000).toFixed(1)}M`} subtitle="Active opportunities" icon={TrendingUp} accent="#10b981" />
        <LeadKpiCard label="Won value" value={`$${(wonValue / 1000).toFixed(0)}K`} subtitle="Completed revenue" icon={Award} accent="#f59e0b" />
        <LeadKpiCard label="Avg deal size" value={`$${(avgDealSize / 1000).toFixed(1)}K`} subtitle="Average value" icon={DollarSign} accent="#8b5cf6" />
      </div>

      {/* Filters and Controls */}
      <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="p-3 text-xs font-bold rounded-2xl border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.toUpperCase()}</option>
              ))}
            </select>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="p-3 text-xs font-bold rounded-2xl border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Layout Toggle (List vs Card) */}
            <div className="flex border rounded-full p-1 bg-muted/30">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-full h-8"
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "card" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="rounded-full h-8"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stage Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedStage("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                selectedStage === "all"
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                  : "bg-background hover:bg-muted text-muted-foreground border-border/65"
              )}
            >
              All {rawDeals.length}
            </button>
            {DEAL_STAGES.map((s) => {
              const count = rawDeals.filter(d => d.stage === s.key).length;
              return (
                <button
                  key={s.key}
                  onClick={() => setSelectedStage(s.key)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                    selectedStage === s.key
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                      : "bg-background hover:bg-muted text-muted-foreground border-border/65"
                  )}
                >
                  {s.label} {count}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDelete}
                className="rounded-full text-xs h-8 px-4"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Selected ({selectedIds.length})
              </Button>
            )}
            <span>{sortedLeads.length} of {totalLeads}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-muted/20 font-bold uppercase tracking-wider text-muted-foreground/80">
                  <th className="p-4 w-10">
                    <input 
                      type="checkbox" 
                      checked={sortedLeads.length > 0 && selectedIds.length === sortedLeads.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary"
                    />
                  </th>
                  <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("title")}>
                    Lead <ArrowUpDown className="h-3.5 w-3.5 inline ml-1" />
                  </th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Source</th>
                  <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("value")}>
                    Value <ArrowUpDown className="h-3.5 w-3.5 inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("createdAt")}>
                    Updated <ArrowUpDown className="h-3.5 w-3.5 inline ml-1" />
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sortedLeads.map((lead) => {
                  const stageObj = DEAL_STAGES.find(s => s.key === lead.stage);
                  const source = lead.tags && lead.tags.length > 0 ? lead.tags[0] : "Other";
                  const initial = lead.contactName ? lead.contactName.charAt(0).toUpperCase() : "L";
                  
                  return (
                    <tr 
                      key={lead._id}
                      className={cn(
                        "hover:bg-muted/15 cursor-pointer transition-colors group/row",
                        selectedIds.includes(lead._id) && "bg-primary/5"
                      )}
                      onClick={() => handleOpenDrawer(lead)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(lead._id)}
                          onChange={() => toggleSelect(lead._id)}
                          className="rounded border-gray-300 text-primary"
                        />
                      </td>
                      <td className="p-4 font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground font-black truncate group-hover/row:text-primary transition-colors">{lead.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate">{lead.contactName} at {lead.company || "General"}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 font-bold">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stageObj?.color ? undefined : "#94a3b8" }} />
                          {stageObj?.label || lead.stage}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase border",
                          lead.priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                          lead.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          "bg-gray-500/10 text-gray-600 border-gray-500/20"
                        )}>
                          {lead.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-muted border text-[10px] font-bold">
                          {source}
                        </span>
                      </td>
                      <td className="p-4 font-black text-emerald-600">
                        ${lead.value.toLocaleString()}
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">
                        {new Date(lead.updatedAt || lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenDialog(lead)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit Lead"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sortedLeads.length === 0 && (
            <div className="text-center py-20">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No leads found</h3>
              <p className="text-muted-foreground">Adjust filters or create a new lead to populate table.</p>
            </div>
          )}
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedLeads.map((lead) => {
            const stageObj = DEAL_STAGES.find(s => s.key === lead.stage);
            const source = lead.tags && lead.tags.length > 0 ? lead.tags[0] : "Other";
            const initial = lead.contactName ? lead.contactName.charAt(0).toUpperCase() : "L";
            
            return (
              <div 
                key={lead._id}
                className={cn(
                  "group relative bg-card border rounded-3xl p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col gap-4 min-h-[180px]",
                  selectedIds.includes(lead._id) && "border-primary bg-primary/5"
                )}
                onClick={() => handleOpenDrawer(lead)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-foreground truncate group-hover:text-primary transition-colors">{lead.title}</h3>
                      <p className="text-[10px] text-muted-foreground truncate">{lead.contactName} at {lead.company || "General"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(lead._id)}
                      onChange={() => toggleSelect(lead._id)}
                      className="rounded border-gray-300 text-primary h-4.5 w-4.5"
                    />
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className={cn("text-[9px] uppercase tracking-wider font-bold border-none", stageObj?.color)}>
                    {stageObj?.label || lead.stage}
                  </Badge>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border",
                    lead.priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                    lead.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                    "bg-gray-500/10 text-gray-600 border-gray-500/20"
                  )}>
                    {lead.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-muted border text-[9px] font-bold">
                    {source}
                  </span>
                </div>

                {/* Footer details */}
                <div className="flex items-end justify-between mt-auto pt-3 border-t">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-medium block">Deal value</span>
                    <span className="text-base font-black text-emerald-600">${lead.value.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-muted-foreground font-medium block">Updated</span>
                    <span className="text-[10px] text-foreground font-bold">{new Date(lead.updatedAt || lead.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {sortedLeads.length === 0 && (
            <div className="text-center py-20 col-span-full">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No leads found</h3>
              <p className="text-muted-foreground">Adjust filters or create a new lead to populate grid.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Lead Dialog */}
      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingDeal}
      />

      {/* Lead Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto rounded-l-3xl p-6 flex flex-col gap-6">
          {selectedLead && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">
                  <Plus className="h-3 w-3 shrink-0" /> Lead Overview
                </div>
                <SheetTitle className="text-2xl font-black tracking-tight text-foreground">
                  {selectedLead.title}
                </SheetTitle>
                <SheetDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {selectedLead.contactName} at {selectedLead.company || "General"}
                </SheetDescription>
              </SheetHeader>

              {/* Action Buttons Row */}
              <div className="flex gap-2.5">
                <Button 
                  onClick={() => handleOpenDialog(selectedLead)}
                  className="flex-1 rounded-full font-bold h-10 text-xs"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Details
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDelete(selectedLead._id)}
                  className="rounded-full font-bold h-10 text-xs px-4"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border/40 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Deal Value</span>
                  <span className="text-base font-black text-emerald-600">${selectedLead.value.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Stage</span>
                  <span className="font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {DEAL_STAGES.find(s => s.key === selectedLead.stage)?.label || selectedLead.stage}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Priority</span>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border inline-block mt-0.5",
                    selectedLead.priority === "high" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                    selectedLead.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                    "bg-gray-500/10 text-gray-600 border-gray-500/20"
                  )}>
                    {selectedLead.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Source</span>
                  <span className="px-2 py-0.5 rounded-full bg-muted border text-[9px] font-bold inline-block mt-0.5">
                    {selectedLead.tags && selectedLead.tags.length > 0 ? selectedLead.tags[0] : "Other"}
                  </span>
                </div>
                {selectedLead.expectedCloseDate && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-muted-foreground font-medium block uppercase tracking-wider">Expected Close Date</span>
                    <span className="font-bold">{new Date(selectedLead.expectedCloseDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                )}
              </div>

              {/* Lead Notes */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</h3>
                <div className="p-4 border rounded-2xl bg-card text-xs text-foreground min-h-[60px] whitespace-pre-wrap leading-relaxed">
                  {selectedLead.notes || "No notes provided for this lead."}
                </div>
              </div>

              {/* Gemini AI Lead Summary Widget */}
              <div className="border border-primary/20 rounded-2xl bg-primary/5 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" /> AI Lead Summary
                  </div>
                  {!aiSummary && (
                    <Button 
                      size="sm" 
                      onClick={generateSummary}
                      disabled={aiSummaryLoading}
                      className="rounded-full text-[10px] h-7 px-3"
                    >
                      {aiSummaryLoading ? (
                        <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1.5" />
                      )}
                      Analyze Lead
                    </Button>
                  )}
                </div>

                {aiSummaryLoading && (
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                )}

                {aiSummary && (
                  <div className="space-y-4 text-xs">
                    {/* Score and Priority badges */}
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Risk Score</span>
                        <span className={cn(
                          "text-sm font-black",
                          aiSummary.riskScore > 70 ? "text-rose-500" :
                          aiSummary.riskScore > 40 ? "text-amber-500" :
                          "text-emerald-500"
                        )}>
                          {aiSummary.riskScore}/100
                        </span>
                      </div>
                      <div className="h-8 border-l border-border/40" />
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Suggested Priority</span>
                        <span className={cn(
                          "font-black uppercase text-[10px]",
                          aiSummary.suggestedPriority === "high" ? "text-rose-500" :
                          aiSummary.suggestedPriority === "medium" ? "text-amber-500" :
                          "text-emerald-500"
                        )}>
                          {aiSummary.suggestedPriority}
                        </span>
                      </div>
                    </div>

                    {/* Summary Content */}
                    <div className="space-y-1 bg-card/65 p-3 border rounded-xl">
                      <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider block">AI Evaluation</span>
                      <p className="text-muted-foreground leading-relaxed font-medium">{aiSummary.summary}</p>
                    </div>

                    {/* Next Action */}
                    <div className="space-y-1 bg-primary/10 p-3 rounded-xl border border-primary/20">
                      <span className="text-[9px] text-primary font-black uppercase tracking-wider block">Next Best Action</span>
                      <p className="text-primary font-bold">{aiSummary.nextBestAction}</p>
                    </div>

                    <Button 
                      variant="ghost" 
                      onClick={() => setAiSummary(null)} 
                      className="text-[9px] text-muted-foreground hover:text-foreground h-6 px-2 self-start rounded-md"
                    >
                      Clear Summary
                    </Button>
                  </div>
                )}
              </div>

              {/* Gemini AI Email Generator Widget */}
              <div className="border border-violet-500/20 rounded-2xl bg-violet-500/5 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-1.5 text-xs font-black text-violet-600 uppercase tracking-wider">
                  <Mail className="h-4 w-4" /> AI Email Generator
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Purpose</label>
                    <select
                      value={emailPurpose}
                      onChange={(e) => setEmailPurpose(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border bg-background"
                    >
                      <option value="Follow-up">Follow-up</option>
                      <option value="Introduction">Introduction</option>
                      <option value="Demo Scheduling">Schedule Demo</option>
                      <option value="Proposal Review">Proposal Review</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Tone</label>
                    <select
                      value={emailTone}
                      onChange={(e) => setEmailTone(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border bg-background"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Friendly">Friendly</option>
                      <option value="Casual">Casual</option>
                      <option value="Formal">Formal</option>
                    </select>
                  </div>
                </div>

                {!aiEmail && (
                  <Button 
                    onClick={generateEmail}
                    disabled={aiEmailLoading}
                    className="rounded-full text-[10px] h-8 bg-violet-600 hover:bg-violet-700 text-white font-bold"
                  >
                    {aiEmailLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                    ) : (
                      <Mail className="h-3 w-3 mr-1.5" />
                    )}
                    Generate Draft
                  </Button>
                )}

                {aiEmailLoading && (
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                )}

                {aiEmail && (
                  <div className="space-y-3 text-xs mt-1">
                    <div className="space-y-1 bg-card/65 p-3 border rounded-xl">
                      <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                        <span className="text-[9px] text-muted-foreground font-black uppercase">Subject Line</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(aiEmail.subject);
                            toast.success("Subject copied!");
                          }}
                          className="text-[9px] text-violet-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                      <p className="font-bold text-foreground">{aiEmail.subject}</p>
                    </div>

                    <div className="space-y-1 bg-card/65 p-3 border rounded-xl">
                      <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                        <span className="text-[9px] text-muted-foreground font-black uppercase">Email Body</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(aiEmail.body);
                            toast.success("Body copied!");
                          }}
                          className="text-[9px] text-violet-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                      <textarea
                        readOnly
                        rows={8}
                        value={aiEmail.body}
                        className="w-full text-xs font-mono bg-transparent border-none focus:outline-none resize-none"
                      />
                    </div>

                    <Button 
                      variant="ghost" 
                      onClick={() => setAiEmail(null)} 
                      className="text-[9px] text-muted-foreground hover:text-foreground h-6 px-2 self-start rounded-md"
                    >
                      Clear Email
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// KPI Widget Component
interface LeadKpiCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
}
function LeadKpiCard({ label, value, subtitle, icon: Icon, accent }: LeadKpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }} />
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-2xl" style={{ background: `${accent}20` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{subtitle}</span>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
    </div>
  );
}
