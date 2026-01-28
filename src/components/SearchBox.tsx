"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Users, Target, CheckCircle2, Loader2 } from 'lucide-react';
import { useSearch, SearchResult } from '@/hooks/useSearch';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// Badge component is not available, using utility classes instead
// Wait, I didn't see badge.tsx in the list. I will assume it DOES NOT exist and use custom styling or standard classes. 
// I'll stick to standard classes with utility tokens.

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { results, loading, error, totalResults, search, clearResults } = useSearch();
  const debouncedQuery = useDebounce(query, 300);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
      setShowResults(true);
    } else {
      clearResults();
      setShowResults(false);
    }
  }, [debouncedQuery, search, clearResults]);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setQuery('');
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return <Users className="h-4 w-4 text-primary" />;
      case 'deal':
        return <Target className="h-4 w-4 text-emerald-500" />;
      case 'task':
        return <CheckCircle2 className="h-4 w-4 text-violet-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (type: string, status: string) => {
    // Return semantic classes
    if (type === 'contact') {
      switch (status) {
        case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
        case 'inactive': return 'bg-muted text-muted-foreground';
        default: return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
      }
    }
    // ... Simplified for other cases to use similar semantic patterns
    return 'bg-muted text-muted-foreground';
  };

  const hasResults = totalResults > 0;
  const showResultsPanel = showResults && (query.length >= 2);

  return (
    <div className="relative w-64 md:w-80">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="pl-9 bg-muted/50 border-transparent focus:bg-background transition-colors"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResultsPanel && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-md shadow-lg border border-border z-50 max-h-[400px] overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
        >
          {loading && (
            <div className="p-6 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <span className="text-xs">Searching...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && !hasResults && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for <span className="font-medium text-foreground">&quot;{query}&quot;</span></p>
            </div>
          )}

          {!loading && !error && hasResults && (
            <div className="py-2">
              {['contacts', 'deals', 'tasks'].map((category) => {
                const items = results[category as keyof typeof results] || [];
                if (items.length === 0) return null;

                return (
                  <div key={category} className="px-2">
                    <h3 className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      {category} ({items.length})
                    </h3>
                    <div className="space-y-1 mb-2">
                      {items.map((result: SearchResult) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-center gap-3 px-2 py-2 rounded-sm hover:bg-muted/60 text-left transition-colors group"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted group-hover:bg-background border border-transparent group-hover:border-border transition-colors">
                            {getIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          {/* Status Badge Simulation */}
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap", getStatusColor(result.type, result.status))}>
                            {result.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="px-2 pt-2 mt-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-primary text-xs h-8"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                >
                  View all {totalResults} results
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
