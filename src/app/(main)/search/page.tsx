"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, Users, Target, CheckCircle2, ArrowLeft,
  Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch, SearchResult } from "@/features/search/hooks/useSearch";
import { cn } from "@/lib/utils";

/* ── helpers ──────────────────────────────────────────── */
function getTypeConfig(type: string) {
  switch (type) {
    case "contact":
      return {
        icon: Users,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      };
    case "deal":
      return {
        icon: Target,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      };
    case "task":
      return {
        icon: CheckCircle2,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      };
    default:
      return {
        icon: Search,
        color: "text-muted-foreground",
        bg: "bg-muted/50",
        badge: "bg-muted text-muted-foreground",
      };
  }
}

function getStatusBadge(type: string, status: string) {
  if (type === "contact") {
    if (status === "active") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (status === "inactive") return "bg-muted text-muted-foreground";
    return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
  }
  if (type === "deal") {
    if (status === "won") return "bg-emerald-500/10 text-emerald-600";
    if (status === "lost") return "bg-rose-500/10 text-rose-600";
    if (status === "negotiation") return "bg-amber-500/10 text-amber-600";
    return "bg-indigo-500/10 text-indigo-600";
  }
  if (type === "task") {
    if (status === "completed") return "bg-emerald-500/10 text-emerald-600";
    if (status === "in_progress") return "bg-indigo-500/10 text-indigo-600";
    if (status === "pending") return "bg-amber-500/10 text-amber-600";
  }
  return "bg-muted text-muted-foreground";
}

/* ── Summary Card ─────────────────────────────────────── */
function SummaryCard({
  count,
  label,
  type,
}: {
  count: number;
  label: string;
  type: string;
}) {
  const { icon: Icon, color, bg } = getTypeConfig(type);
  return (
    <div className="flex items-center gap-4 rounded-3xl border bg-card/60 backdrop-blur-sm p-5 hover:-translate-y-0.5 transition-transform">
      <div className={cn("p-3 rounded-2xl", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground">{count}</p>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ── Result Row ───────────────────────────────────────── */
function ResultRow({
  result,
  onClick,
}: {
  result: SearchResult;
  onClick: () => void;
}) {
  const { icon: Icon, color, bg, badge } = getTypeConfig(result.type);
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-primary/5 text-left transition-all duration-200"
    >
      <div className={cn("p-2.5 rounded-xl shrink-0", bg)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground truncate">{result.title}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{result.subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("text-[10px] font-bold uppercase px-2.5 py-1 rounded-full", badge)}>
          {result.type}
        </span>
        <span
          className={cn(
            "text-[10px] font-bold capitalize px-2.5 py-1 rounded-full",
            getStatusBadge(result.type, result.status)
          )}
        >
          {result.status.replace(/_/g, " ")}
        </span>
      </div>
    </button>
  );
}

/* ── Main Search Content ──────────────────────────────── */
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const { results, loading, error, totalResults, search } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query) {
      search(query);
      setHasSearched(true);
    }
  }, [query, search]);

  const allResults = [...results.contacts, ...results.deals, ...results.tasks];

  /* ── Empty query ── */
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="p-6 rounded-3xl bg-primary/5 mb-6">
          <Search className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">Start searching</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Use the search bar above to find contacts, deals, and tasks.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Search Results</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? (
              "Searching..."
            ) : hasSearched ? (
              totalResults > 0
                ? `Found ${totalResults} result${totalResults > 1 ? "s" : ""} for "${query}"`
                : `No results found for "${query}"`
            ) : null}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-3xl" />)}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 rounded-3xl border border-destructive/20 bg-destructive/5 p-5 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* No results */}
      {!loading && !error && hasSearched && totalResults === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-6 rounded-3xl bg-muted/50 mb-6">
            <Search className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">No results found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search terms or check for typos.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && totalResults > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard count={results.contacts.length} label="Contacts" type="contact" />
            <SummaryCard count={results.deals.length} label="Deals" type="deal" />
            <SummaryCard count={results.tasks.length} label="Tasks" type="task" />
          </div>

          {/* Results list */}
          <div className="rounded-3xl border bg-card/60 backdrop-blur-sm p-5">
            <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              All Results
              <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                {totalResults}
              </span>
            </h3>
            <div className="space-y-1">
              {allResults.map((result) => (
                <ResultRow
                  key={`${result.type}-${result.id}`}
                  result={result}
                  onClick={() => router.push(result.url)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
