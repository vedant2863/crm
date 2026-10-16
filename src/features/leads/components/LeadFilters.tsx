"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchInput, ViewToggle } from "@/components/common";

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedPriority: string;
  setSelectedPriority: (val: string) => void;
  selectedSource: string;
  setSelectedSource: (val: string) => void;
  viewMode: "table" | "card";
  setViewMode: (mode: "table" | "card") => void;
  selectedStage: string;
  setSelectedStage: (stage: string) => void;
  selectedIds: string[];
  handleBulkDelete: () => void;
  sortedLeadsLength: number;
  totalLeads: number;
  rawDeals: any[];
  DEAL_STAGES: { key: string; label: string; color: string }[];
  PRIORITIES: string[];
  SOURCES: string[];
}

export function LeadFilters({
  searchTerm,
  setSearchTerm,
  selectedPriority,
  setSelectedPriority,
  selectedSource,
  setSelectedSource,
  viewMode,
  setViewMode,
  selectedStage,
  setSelectedStage,
  selectedIds,
  handleBulkDelete,
  sortedLeadsLength,
  totalLeads,
  rawDeals,
  DEAL_STAGES,
  PRIORITIES,
  SOURCES,
}: LeadFiltersProps) {
  return (
    <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Box */}
        <SearchInput
          placeholder="Search by name, company or email..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full md:max-w-md"
        />

        {/* Filters and Mode Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-10 px-3 rounded-xl border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Priority: All</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="h-10 px-3 rounded-xl border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Source: All</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Table vs Card Toggle */}
          <ViewToggle<"table" | "card">
            mode={viewMode}
            onChange={setViewMode}
            options={[
              { value: "table", label: "Table" },
              { value: "card", label: "Grid" },
            ]}
          />
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

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="h-8 shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadFilters;
