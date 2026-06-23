"use client";

import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Users, Target, CheckCircle2, Loader2, Sparkles, Settings, ArrowRight } from "lucide-react";
import { useSearch, SearchResult } from "@/features/search/hooks/useSearch";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FlattenedItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  category: string;
  type: "contact" | "deal" | "task" | "page";
  status?: string;
}

const STATIC_PAGES = [
  { id: "p-dashboard", title: "Dashboard", subtitle: "Overview of your sales pipeline and metrics", url: "/dashboard", category: "Pages", type: "page" as const },
  { id: "p-leads", title: "Leads", subtitle: "Manage your potential customers and prospects", url: "/leads", category: "Pages", type: "page" as const },
  { id: "p-pipeline", title: "Pipeline Board", subtitle: "Drag and drop deals across stages", url: "/pipeline", category: "Pages", type: "page" as const },
  { id: "p-contacts", title: "Contacts", subtitle: "Customer database and interactions", url: "/contacts", category: "Pages", type: "page" as const },
  { id: "p-followups", title: "Follow-ups & Tasks", subtitle: "Your scheduled follow-up actions", url: "/follow-ups", category: "Pages", type: "page" as const },
  { id: "p-notes", title: "Notes", subtitle: "View and edit your scratchpad notes", url: "/notes", category: "Pages", type: "page" as const },
  { id: "p-settings", title: "Settings", subtitle: "Account preferences and configurations", url: "/settings", category: "Pages", type: "page" as const },
];

export default function SearchBox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { results, loading, error, search, clearResults } = useSearch();
  const debouncedQuery = useDebounce(query, 250);

  // Trigger command palette via keyboard shortcuts (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync keyboard shortcut label depending on OS
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMac = navigator.userAgent.toLowerCase().includes("mac");
      setShortcutLabel(isMac ? "⌘K" : "Ctrl K");
    }
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      search(debouncedQuery);
    } else {
      clearResults();
    }
    setSelectedIndex(0);
  }, [debouncedQuery, search, clearResults]);

  // Handle closing dialog resets
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setQuery("");
      clearResults();
      setSelectedIndex(0);
    }
  };

  // Categorize pages matching query
  const matchingPages = useMemo(() => {
    if (!query.trim()) return STATIC_PAGES;
    const q = query.toLowerCase();
    return STATIC_PAGES.filter(
      (p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  // Flattened results for keyboard navigation index mapping
  const flattenedItems = useMemo<FlattenedItem[]>(() => {
    const list: FlattenedItem[] = [];

    // Add matching pages
    matchingPages.forEach((p) => {
      list.push({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        url: p.url,
        category: "Navigation",
        type: "page",
      });
    });

    // Add API search results
    if (query.trim().length >= 2) {
      const contacts = results.contacts || [];
      contacts.forEach((c) => {
        list.push({
          id: c.id,
          title: c.title,
          subtitle: c.subtitle,
          url: c.url,
          category: "Contacts",
          type: "contact",
          status: c.status,
        });
      });

      const deals = results.deals || [];
      deals.forEach((d) => {
        list.push({
          id: d.id,
          title: d.title,
          subtitle: d.subtitle,
          url: d.url,
          category: "Deals",
          type: "deal",
          status: d.status,
        });
      });

      const tasks = results.tasks || [];
      tasks.forEach((t) => {
        list.push({
          id: t.id,
          title: t.title,
          subtitle: t.subtitle,
          url: t.url,
          category: "Tasks",
          type: "task",
          status: t.status,
        });
      });
    }

    return list;
  }, [matchingPages, results, query]);

  // Auto-correct selection boundaries when list size changes
  useEffect(() => {
    if (selectedIndex >= flattenedItems.length) {
      setSelectedIndex(Math.max(0, flattenedItems.length - 1));
    }
  }, [flattenedItems, selectedIndex]);

  // Execute selection
  const executeSelection = (item: FlattenedItem) => {
    router.push(item.url);
    handleOpenChange(false);
  };

  // Keyboard navigation inside search dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flattenedItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % flattenedItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const activeItem = flattenedItems[selectedIndex];
      if (activeItem) {
        executeSelection(activeItem);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleOpenChange(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "contact":
        return <Users className="h-4 w-4 text-sky-500" />;
      case "deal":
        return <Target className="h-4 w-4 text-emerald-500" />;
      case "task":
        return <CheckCircle2 className="h-4 w-4 text-violet-500" />;
      case "page":
        return <ArrowRight className="h-4 w-4 text-muted-foreground/60" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Organize display lists grouped by Category
  const groupedResults = useMemo(() => {
    const groups: Record<string, FlattenedItem[]> = {};
    flattenedItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [flattenedItems]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "group relative flex items-center justify-between gap-4 w-44 sm:w-56 h-9 px-3 rounded-full border border-border/40 bg-muted/40 hover:bg-muted/70 hover:border-border text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer transition-all duration-300 shadow-sm"
        )}
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>Quick search...</span>
        </span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border/50 bg-background px-1.5 font-mono text-[9px] font-bold text-muted-foreground/80 opacity-100 group-hover:text-foreground transition-all duration-300">
          {shortcutLabel}
        </kbd>
      </button>

      {/* Glassmorphic Command Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-w-2xl bg-card/85 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-0 overflow-hidden gap-0 top-[25%] translate-y-[-25%] animate-in fade-in-0 duration-200"
        >
          <DialogTitle className="sr-only">Search CRM</DialogTitle>

          {/* Search Header Input */}
          <div className="relative flex items-center border-b border-border/40 px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              autoFocus
              type="text"
              placeholder="Search contacts, deals, tasks, pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-14 w-full bg-transparent border-0 outline-none focus:ring-0 px-3 text-sm text-foreground placeholder:text-muted-foreground/50"
            />
            {loading && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {/* Search Results Display Area */}
          <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin">
            {error && (
              <div className="p-4 text-center text-destructive text-xs">
                {error}
              </div>
            )}

            {flattenedItems.length === 0 && !loading && (
              <div className="p-10 text-center">
                <Search className="h-8 w-8 text-muted-foreground/45 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">
                  No results found for &quot;<span className="text-foreground">{query}</span>&quot;
                </p>
              </div>
            )}

            {flattenedItems.length > 0 && (
              <div className="space-y-4">
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category} className="space-y-1">
                    <h3 className="px-3 py-1.5 text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest">
                      {category}
                    </h3>
                    <div className="space-y-[2px]">
                      {items.map((item) => {
                        // Find the index of this item in the flattened list
                        const itemIndex = flattenedItems.findIndex((x) => x.id === item.id);
                        const isSelected = itemIndex === selectedIndex;

                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            onClick={() => executeSelection(item)}
                            className={cn(
                              "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left cursor-pointer transition-all duration-200 border border-transparent",
                              isSelected
                                ? "bg-primary/10 text-primary border-primary/20 shadow-xs"
                                : "text-foreground hover:bg-muted/40"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={cn(
                                  "flex h-7 w-7 items-center justify-center rounded-lg bg-muted transition-colors border border-border/30",
                                  isSelected && "bg-background border-primary/25"
                                )}
                              >
                                {item.type === "page" && item.id === "p-settings" ? (
                                  <Settings className="h-4 w-4 text-primary" />
                                ) : (
                                  getIcon(item.type)
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold truncate leading-none mb-1">
                                  {item.title}
                                </p>
                                {item.subtitle && (
                                  <p className="text-[10px] text-muted-foreground truncate font-medium">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Badges / Extras */}
                            <div className="flex items-center gap-2 shrink-0">
                              {item.status && (
                                <span
                                  className={cn(
                                    "text-[9px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap uppercase tracking-wider",
                                    item.type === "contact" && item.status === "active"
                                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                                      : "bg-muted text-muted-foreground border border-border/40"
                                  )}
                                >
                                  {item.status}
                                </span>
                              )}
                              {isSelected && (
                                <span className="text-[10px] text-primary/80 font-semibold flex items-center gap-0.5">
                                  Jump <span className="text-[8px] border border-primary/20 rounded px-1 py-0.2 bg-background font-mono leading-none">↵</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dialog Keyboard Shortcut Footer */}
          <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5 bg-muted/15 text-[10px] text-muted-foreground font-semibold">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="border border-border/40 rounded px-1 bg-background">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="border border-border/40 rounded px-1 bg-background">↵</kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="border border-border/40 rounded px-1 bg-background">esc</kbd> Close
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-primary text-[9px] font-black uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              <span>CRM Spotlight</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
