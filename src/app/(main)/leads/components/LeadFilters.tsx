
import { Search, Table, Grid, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
          <span>{sortedLeadsLength} of {totalLeads}</span>
        </div>
      </div>
    </div>
  );
}
