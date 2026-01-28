"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Users, Target, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearch, SearchResult } from '@/hooks/useSearch';
import { useRouter } from 'next/navigation';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const { results, loading, error, totalResults, search } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query) {
      search(query);
      setHasSearched(true);
    }
  }, [query, search]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'deal':
        return <Target className="h-5 w-5 text-green-600" />;
      case 'task':
        return <CheckCircle2 className="h-5 w-5 text-purple-600" />;
      default:
        return <Search className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (type: string, status: string) => {
    if (type === 'contact') {
      switch (status) {
        case 'active': return 'text-green-600 bg-green-100';
        case 'inactive': return 'text-gray-600 bg-gray-100';
        case 'lead': return 'text-blue-600 bg-blue-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    }
    if (type === 'deal') {
      switch (status) {
        case 'won': return 'text-green-600 bg-green-100';
        case 'lost': return 'text-red-600 bg-red-100';
        case 'negotiation': return 'text-orange-600 bg-orange-100';
        default: return 'text-blue-600 bg-blue-100';
      }
    }
    if (type === 'task') {
      switch (status) {
        case 'completed': return 'text-green-600 bg-green-100';
        case 'in_progress': return 'text-blue-600 bg-blue-100';
        case 'pending': return 'text-yellow-600 bg-yellow-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    }
    return 'text-gray-600 bg-gray-100';
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
  };

  const allResults = [
    ...results.contacts,
    ...results.deals,
    ...results.tasks
  ];

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Search className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No search query provided
        </h2>
        <p className="text-gray-500 mb-4">
          Please enter a search term to find contacts, deals, and tasks.
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-600 mt-2">
            {hasSearched && !loading && (
              <>
                {totalResults > 0
                  ? `Found ${totalResults} results for "${query}"`
                  : `No results found for "${query}"`
                }
              </>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && hasSearched && totalResults === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <Search className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No results found
          </h2>
          <p className="text-gray-500 mb-4">
            Try adjusting your search terms or check for typos.
          </p>
        </div>
      )}

      {!loading && !error && totalResults > 0 && (
        <>
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Contacts</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {results.contacts.length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Deals</p>
                    <p className="text-2xl font-bold text-green-600">
                      {results.deals.length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasks</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {results.tasks.length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Results */}
          <Card>
            <CardHeader>
              <CardTitle>All Results ({totalResults})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 text-left transition-colors"
                  >
                    {getIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs capitalize px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {result.type}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(result.type, result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
