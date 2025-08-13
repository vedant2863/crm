import { Contact } from "@/feature/contact/type";
import { useMemo } from "react";


export interface Filters {
  searchTerm: string;
  page: number;
  perPage: number;
  status: string; // e.g., "all" | "active" | "inactive"
}

export function usePaginatedContacts(contacts: Contact[], filters: Filters) {
  return useMemo(() => {
    const term = filters.searchTerm.toLowerCase();
    const start = (filters.page - 1) * filters.perPage;

    const result: Contact[] = [];
    let matchCount = 0;

    for (const c of contacts) {
      // Filtering
      if (filters.status !== "all" && c.status !== filters.status) continue;
      if (
        term &&
        !["name", "email", "phone", "company", "position"].some((key) =>
          (c[key as keyof Contact] ?? "")
            .toString()
            .toLowerCase()
            .includes(term)
        )
      )
        continue;

      // Count matches
      matchCount++;

      // Pagination
      if (matchCount > start && result.length < filters.perPage) {
        result.push(c);
      }
    }

    return { paginatedContacts: result, total: matchCount };
  }, [contacts, filters]);
}
