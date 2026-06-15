import { useState, useCallback, useRef } from 'react';

export interface SearchResult {
  id: string;
  type: 'contact' | 'deal' | 'task';
  title: string;
  subtitle: string;
  status: string;
  url: string;
}

export interface SearchResults {
  contacts: SearchResult[];
  deals: SearchResult[];
  tasks: SearchResult[];
}

export interface SearchResponse {
  results: SearchResults;
  totalResults: number;
  query: string;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResults>({
    contacts: [],
    deals: [],
    tasks: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state if query is too short
    if (!query || query.trim().length < 2) {
      setResults({ contacts: [], deals: [], tasks: [] });
      setTotalResults(0);
      setError(null);
      setLoading(false);
      return;
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query.trim())}`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
      setTotalResults(data.totalResults);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults({ contacts: [], deals: [], tasks: [] });
    setTotalResults(0);
    setError(null);
    setLoading(false);
  }, []);

  return {
    results,
    loading,
    error,
    totalResults,
    search,
    clearResults
  };
}
