"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, Users, Target, CheckCircle2, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearch, SearchResult } from "@/features/search/hooks/useSearch";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  MetricCard,
  StatusBadge,
} from "@/components/common";

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
        <StatusBadge status={result.status} />
      </div>
    </button>
  );
}

/* ── Inner Search Component ───────────────────────────── */
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const { results, loading, error, search } = useSearch();
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
      <EmptyState
        icon={Search}
        title="Start searching"
        description="Use the search bar above to find contacts, deals, and tasks across your workspace."
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        }
      />
    );
  }

  const totalResults = allResults.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Search Results"
        description={
          query
            ? `Found ${totalResults} result${totalResults === 1 ? "" : "s"} for "${query}"`
            : "Search results"
        }
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Loading */}
      {loading && <LoadingSkeleton type="cards" count={3} />}

      {/* Error */}
      {error && !loading && (
        <ErrorState
          title="Search Failed"
          message={error}
        />
      )}

      {/* No results */}
      {!loading && !error && hasSearched && totalResults === 0 && (
        <EmptyState
          icon={Search}
          title="No results found"
          description="Try adjusting your search terms or check for typos."
        />
      )}

      {/* Results */}
      {!loading && !error && totalResults > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Contacts"
              value={results.contacts.length}
              icon={Users}
              accent="primary"
            />
            <MetricCard
              label="Deals"
              value={results.deals.length}
              icon={Target}
              accent="emerald"
            />
            <MetricCard
              label="Tasks"
              value={results.tasks.length}
              icon={CheckCircle2}
              accent="purple"
            />
          </div>

          {/* Results list */}
          <div className="rounded-3xl border bg-card/60 backdrop-blur-sm p-5 shadow-sm">
            <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              All Results
              <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                {totalResults}
              </span>
            </h3>

            <div className="divide-y divide-border/30">
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

/* ── Main Export (Suspense Wrapped) ───────────────────── */
export function SearchView() {
  return (
    <div className="max-w-5xl mx-auto py-4">
      <Suspense fallback={<LoadingSkeleton type="page" />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}

export default SearchView;
