import { useMemo } from "react";

export interface Filters {
  searchTerm: string;
  page: number;
  perPage: number;
  status: string; // e.g., "all" | "active" | "inactive" or deal stages
}

/**
 * A generic hook to handle pagination, search, and status filtering across any array of items.
 *
 * @param items The raw array of data items
 * @param filters Pagination and search filters
 * @param searchKeys Keys on the data type to perform keyword searches on
 */
export function usePaginated<T>(
  items: T[],
  filters: Filters,
  searchKeys: (keyof T)[]
) {
  return useMemo(() => {
    const term = filters.searchTerm.toLowerCase();
    const start = (filters.page - 1) * filters.perPage;

    const result: T[] = [];
    let matchCount = 0;

    for (const item of items) {
      // Filtering by status or stage
      if (filters.status && filters.status !== "all") {
        const obj = item as { status?: string; stage?: string };
        const itemStatus = obj.status || obj.stage;
        if (itemStatus !== filters.status) {
          continue;
        }
      }

      // Filtering by search term across designated keys
      if (term) {
        const matchesSearch = searchKeys.some((key) => {
          const val = item[key];
          return (val ?? "")
            .toString()
            .toLowerCase()
            .includes(term);
        });
        if (!matchesSearch) continue;
      }

      // Count matches
      matchCount++;

      // Pagination
      if (matchCount > start && result.length < filters.perPage) {
        result.push(item);
      }
    }

    return {
      paginatedItems: result,
      paginatedContacts: result, // Backwards compatibility wrapper
      total: matchCount,
    };
  }, [items, filters, searchKeys]);
}
