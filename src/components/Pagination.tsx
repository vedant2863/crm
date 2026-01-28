"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  total: number;
  perPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default function Pagination({
  total,
  perPage,
  currentPage,
  setCurrentPage,
}: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        // Start: [1, 2, 3, 4, ..., total]
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // End: [1, ..., total-3, total-2, total-1, total]
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle: [1, ..., current-1, current, current+1, ..., total]
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) => (
          typeof page === 'number' ? (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => goToPage(page)}
              className="h-8 w-8"
              size="icon"
            >
              {page}
            </Button>
          ) : (
            <div key={index} className="flex h-8 w-8 items-center justify-center">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
          )
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}
