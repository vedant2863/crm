"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  total: number;
  PerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default function Pagination({
  total,
  PerPage,
  currentPage,
  setCurrentPage,
}: PaginationProps) {
  const totalPages = Math.ceil(total / PerPage);

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex justify-center gap-2 mt-4">
      <Button
        variant="outline"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>

      {Array.from({ length: totalPages }, (_, i) => (
        <Button
          key={i}
          variant={currentPage === i + 1 ? "default" : "outline"}
          onClick={() => goToPage(i + 1)}
        >
          {i + 1}
        </Button>
      ))}

      <Button
        variant="outline"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}
