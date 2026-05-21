"use client";

import { ReactNode, useMemo, useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/TablePagination";
import { TableSearch } from "@/components/ui/TableSearch";
import { cn } from "@/lib/utils";

export interface PaginatedTableColumn<T> {
  id: string;
  header: ReactNode;
  className?: string;
  headerClassName?: string;
  render: (row: T) => ReactNode;
  searchValue?: (row: T) => string;
}

interface PaginatedTableProps<T> {
  rows: T[];
  columns: Array<PaginatedTableColumn<T>>;
  getRowKey: (row: T) => string;
  searchPlaceholder?: string;
  showSearchMinRows?: number;
  variant?: "light" | "dark";
  className?: string;
  tableClassName?: string;
  stickyHeader?: boolean;
}

export function PaginatedTable<T>({
  rows,
  columns,
  getRowKey,
  searchPlaceholder = "Search rows…",
  showSearchMinRows = 8,
  variant = "dark",
  className,
  tableClassName,
  stickyHeader = true
}: PaginatedTableProps<T>) {
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      columns.some((column) => {
        if (!column.searchValue) {
          return false;
        }
        return column.searchValue(row).toLowerCase().includes(query);
      })
    );
  }, [columns, rows, search]);

  const { paginatedItems, page, setPage, pageSize, setPageSize, totalPages, totalRows } = usePagination(filteredRows, {
    resetDeps: [search]
  });

  const theadClass = variant === "light" ? "bg-slate-50" : "bg-surface";
  const headerTextClass = variant === "light" ? "text-slate-500" : "text-textMuted";
  const rowBorderClass = variant === "light" ? "border-slate-100" : "border-border/60";
  const rowHoverClass =
    variant === "light" ? "hover:bg-slate-50/80" : "hover:bg-surfaceElevated/60 even:bg-surfaceElevated/20";
  const cellTextClass = variant === "light" ? "text-slate-700" : "text-textSecondary";

  return (
    <div className={cn("space-y-4", className)}>
      {rows.length >= showSearchMinRows ? (
        <TableSearch value={search} onChange={setSearch} placeholder={searchPlaceholder} variant={variant} />
      ) : null}

      {filteredRows.length === 0 ? (
        <p className={cn("py-6 text-center text-sm", variant === "light" ? "text-slate-500" : "text-textMuted")}>
          No rows match your search.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg ring-1 ring-border/40">
            <table className={cn("min-w-full text-sm", tableClassName)}>
              <thead className={cn(stickyHeader && "sticky top-0 z-[1]", theadClass)}>
                <tr className={cn("border-b text-left text-xs uppercase tracking-wide", rowBorderClass, headerTextClass)}>
                  {columns.map((column) => (
                    <th key={column.id} className={cn("py-2.5 pr-3 first:pl-1 last:pr-1", column.headerClassName)}>
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((row) => (
                  <tr key={getRowKey(row)} className={cn("border-b transition-colors", rowBorderClass, rowHoverClass)}>
                    {columns.map((column) => (
                      <td key={column.id} className={cn("py-3 pr-3 first:pl-1 last:pr-1 align-top", cellTextClass, column.className)}>
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            totalRows={totalRows}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            variant={variant}
          />
        </>
      )}
    </div>
  );
}
