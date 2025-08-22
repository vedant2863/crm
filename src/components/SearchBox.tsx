"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Users, Target, CheckCircle2, Loader2 } from 'lucide-react';
import { useSearch, SearchResult } from '@/hooks/useSearch';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

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
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'deal':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'task':
        return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (type: string, status: string) => {
    if (type === 'contact') {
      switch (status) {
        case 'active': return 'text-green-600';
        case 'inactive': return 'text-gray-600';
        case 'lead': return 'text-blue-600';
        default: return 'text-gray-600';
      }
    }
    if (type === 'deal') {
      switch (status) {
        case 'won': return 'text-green-600';
        case 'lost': return 'text-red-600';
        case 'negotiation': return 'text-orange-600';
        default: return 'text-blue-600';
      }
    }
    if (type === 'task') {
      switch (status) {
        case 'completed': return 'text-green-600';
        case 'in_progress': return 'text-blue-600';
        case 'pending': return 'text-yellow-600';
        default: return 'text-gray-600';
      }
    }
    return 'text-gray-600';
  };

  const hasResults = totalResults > 0;
  const showResultsPanel = showResults && (query.length >= 2);

  return (
    <div className="relative w-64">
      {/* Search Input */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search contacts, deals, tasks..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="bg-transparent outline-none px-2 text-sm w-full"
        />
        {loading && (
          <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResultsPanel && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
        >
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-600">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && !hasResults && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {!loading && !error && hasResults && (
            <>
              {/* Contacts */}
              {results.contacts.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                    Contacts ({results.contacts.length})
                  </h3>
                  {results.contacts.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-50 text-left transition-colors"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getStatusColor(result.type, result.status)}`}>
                        {result.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Deals */}
              {results.deals.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                    Deals ({results.deals.length})
                  </h3>
                  {results.deals.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-50 text-left transition-colors"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getStatusColor(result.type, result.status)}`}>
                        {result.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                    Tasks ({results.tasks.length})
                  </h3>
                  {results.tasks.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-50 text-left transition-colors"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getStatusColor(result.type, result.status)}`}>
                        {result.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* View All Results */}
              <div className="p-2 border-t border-gray-100">
                <button 
                  onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  View all {totalResults} results
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
