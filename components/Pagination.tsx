import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  limit?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit = 10,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= limit)) {
    return null;
  }

  const startItem = totalItems ? (currentPage - 1) * limit + 1 : undefined;
  const endItem = totalItems ? Math.min(currentPage * limit, totalItems) : undefined;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 ${className}`}
    >
      {/* Information text */}
      <div>
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Menampilkan <strong className="text-slate-900">{totalItems === 0 ? 0 : startItem}</strong> -{" "}
            <strong className="text-slate-900">{endItem}</strong> dari{" "}
            <strong className="text-slate-900">{totalItems}</strong> data
          </span>
        ) : (
          <span>
            Halaman <strong className="text-slate-900">{currentPage}</strong> dari{" "}
            <strong className="text-slate-900">{totalPages || 1}</strong>
          </span>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold disabled:opacity-40 disabled:pointer-events-none transition"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === "number" ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                  currentPage === p
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400 font-bold">
                ...
              </span>
            )
          )}
        </div>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold disabled:opacity-40 disabled:pointer-events-none transition"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
