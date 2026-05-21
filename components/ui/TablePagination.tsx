"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  variant?: "light" | "dark";
  className?: string;
}

function navButtonClass(variant: "light" | "dark", disabled: boolean) {
  if (variant === "light") {
    return cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900",
      disabled && "cursor-not-allowed opacity-40 hover:border-slate-200 hover:text-slate-600"
    );
  }

  return cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surfaceElevated text-textSecondary transition hover:border-brand/40 hover:text-textPrimary",
    disabled && "cursor-not-allowed opacity-40 hover:border-border hover:text-textSecondary"
  );
}

export function TablePagination({
  currentPage,
  totalPages,
  totalRows,
  pageSize,
  onPageChange,
  onPageSizeChange,
  variant = "dark",
  className
}: TablePaginationProps) {
  const start = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRows);
  const atFirst = currentPage <= 1;
  const atLast = currentPage >= totalPages;

  const selectClass =
    variant === "light"
      ? "rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400"
      : "rounded-lg border border-border bg-surfaceElevated px-2 py-1.5 text-sm text-textPrimary outline-none focus:border-brand/50";

  const pageBadgeClass =
    variant === "light"
      ? "min-w-[4.5rem] rounded-lg bg-slate-100 px-3 py-1.5 text-center text-sm font-medium text-slate-700"
      : "min-w-[4.5rem] rounded-lg border border-border bg-surfaceElevated px-3 py-1.5 text-center text-sm font-medium text-textPrimary";

  const mutedText = variant === "light" ? "text-slate-500" : "text-textMuted";
  const accentText = variant === "light" ? "text-slate-700" : "text-textSecondary";

  if (totalRows === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between",
        variant === "light" ? "border-slate-100" : "border-border",
        className
      )}
    >
      <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-sm", mutedText)}>
        <p>
          Showing{" "}
          <span className={cn("font-medium tabular-nums", accentText)}>{start}</span>
          {" – "}
          <span className={cn("font-medium tabular-nums", accentText)}>{end}</span>
          {" of "}
          <span className={cn("font-medium tabular-nums", accentText)}>{totalRows}</span>
        </p>
        {onPageSizeChange ? (
          <label className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide">Per page</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className={selectClass}
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={atFirst}
            className={navButtonClass(variant, atFirst)}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={atFirst}
            className={navButtonClass(variant, atFirst)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <span className={pageBadgeClass}>
          {currentPage} / {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={atLast}
            className={navButtonClass(variant, atLast)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={atLast}
            className={navButtonClass(variant, atLast)}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
