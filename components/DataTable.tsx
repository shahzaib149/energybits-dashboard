"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, EyeOff } from "lucide-react";
import { EmptyState as LightEmptyState } from "@/components/EmptyState";
import { EmptyState as DarkEmptyState } from "@/components/ui/EmptyState";
import { TablePagination } from "@/components/ui/TablePagination";
import { TableSearch } from "@/components/ui/TableSearch";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";

export interface DataColumn<T> {
  id: string;
  label: string;
  render: (row: T) => ReactNode;
  getSearchValue?: (row: T) => string;
  className?: string;
  defaultVisible?: boolean;
}

interface DataTableProps<T> {
  title: string;
  rows: T[];
  columns: Array<DataColumn<T>>;
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  onRowClick?: (row: T) => void;
  showColumnToggle?: boolean;
  variant?: "light" | "dark";
}

export function DataTable<T>({
  title,
  rows,
  columns,
  getRowId,
  searchPlaceholder = "Search records...",
  toolbar,
  onRowClick,
  showColumnToggle = true,
  variant = "light"
}: DataTableProps<T>) {
  const isDark = variant === "dark";
  const defaultVisible = useMemo(
    () => columns.filter((column) => column.defaultVisible !== false).map((column) => column.id),
    [columns]
  );
  const [search, setSearch] = useState("");
  const [showColumns, setShowColumns] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisible);

  useEffect(() => {
    setVisibleColumns(defaultVisible);
  }, [defaultVisible]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) {
      return rows;
    }

    const query = search.trim().toLowerCase();

    return rows.filter((row) =>
      columns.some((column) => {
        const source = column.getSearchValue ? column.getSearchValue(row) : "";
        return source.toLowerCase().includes(query);
      })
    );
  }, [columns, rows, search]);

  const visible = columns.filter((column) => visibleColumns.includes(column.id));
  const { paginatedItems, page, setPage, pageSize, setPageSize, totalPages, totalRows } = usePagination(filteredRows, {
    resetDeps: [search]
  });

  function toggleColumn(columnId: string) {
    setVisibleColumns((current) => {
      if (current.includes(columnId)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((id) => id !== columnId);
      }

      return [...current, columnId];
    });
  }

  const desktopTableClass = isDark
    ? "hidden overflow-hidden rounded-xl border border-border bg-surface shadow-sm md:block"
    : "table-shell hidden md:block";

  const toolbarShellClass = isDark
    ? "rounded-xl border border-border bg-surface p-4"
    : "card p-4";

  const mobileCardClass = isDark
    ? cn("rounded-xl border border-border bg-surface p-4", onRowClick ? "cursor-pointer active:bg-surfaceElevated" : "")
    : cn("card p-4", onRowClick ? "cursor-pointer active:bg-slate-50" : "");

  return (
    <div className="space-y-4">
      <div className={toolbarShellClass}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className={cn("relative w-full", showColumnToggle ? "sm:max-w-md" : "")}>
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder={searchPlaceholder}
                variant={variant}
                className="max-w-none"
              />
            </div>
            {showColumnToggle ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowColumns((current) => !current)}
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition sm:w-auto",
                    isDark
                      ? "border-border bg-surfaceElevated text-textSecondary hover:border-brand/40 hover:text-textPrimary"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Columns
                </button>
                {showColumns ? (
                  <div
                    className={cn(
                      "absolute left-0 right-0 z-20 mt-2 rounded-xl border p-3 shadow-soft sm:left-auto sm:right-0 sm:w-60",
                      isDark ? "border-border bg-surfaceElevated" : "border-slate-200 bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em]",
                        isDark ? "text-textMuted" : "text-slate-400"
                      )}
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Visibility
                    </div>
                    <div className="space-y-2">
                      {columns.map((column) => (
                        <label
                          key={column.id}
                          className={cn("flex items-center gap-3 text-sm", isDark ? "text-textSecondary" : "text-slate-600")}
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(column.id)}
                            onChange={() => toggleColumn(column.id)}
                            className={cn(
                              "rounded focus:ring-brand/50",
                              isDark ? "border-border bg-surface text-brand" : "border-slate-300 text-slate-900 focus:ring-slate-400"
                            )}
                          />
                          {column.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          {toolbar ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">{toolbar}</div> : null}
        </div>
      </div>

      {filteredRows.length === 0 ? (
        isDark ? (
          <DarkEmptyState title={`No ${title.toLowerCase()} matched`} description="Try a different search term." />
        ) : (
          <LightEmptyState title={`No ${title.toLowerCase()} matched`} />
        )
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {paginatedItems.map((row) => (
              <article
                key={getRowId(row)}
                className={mobileCardClass}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {visible.map((column, index) => (
                  <div
                    key={column.id}
                    className={cn(index === 0 ? "" : "mt-3 border-t pt-3", isDark ? "border-border" : "border-slate-100")}
                  >
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.16em]",
                        isDark ? "text-textMuted" : "text-slate-400"
                      )}
                    >
                      {column.label}
                    </p>
                    <div className={cn("mt-1 text-sm", isDark ? "text-textPrimary" : "text-slate-700")}>
                      {column.render(row)}
                    </div>
                  </div>
                ))}
              </article>
            ))}
            <div className={cn(isDark ? "overflow-hidden rounded-xl border border-border bg-surface px-4" : "card overflow-hidden px-4")}>
              <TablePagination
                currentPage={page}
                totalPages={totalPages}
                totalRows={totalRows}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                variant={variant}
              />
            </div>
          </div>

          <div className={desktopTableClass}>
            <div className="overflow-x-auto">
              <table className={cn("min-w-full divide-y", isDark ? "divide-border" : "divide-slate-100")}>
                <thead className={isDark ? "bg-surfaceElevated" : "bg-slate-50"}>
                  <tr>
                    {visible.map((column) => (
                      <th
                        key={column.id}
                        className={cn(
                          "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em]",
                          isDark ? "text-textMuted" : "text-slate-500",
                          column.className
                        )}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={cn("divide-y", isDark ? "divide-border bg-surface" : "divide-slate-100 bg-white")}>
                  {paginatedItems.map((row) => (
                    <tr
                      key={getRowId(row)}
                      className={cn(
                        "transition",
                        isDark ? "hover:bg-surfaceElevated" : "hover:bg-slate-50",
                        onRowClick ? "cursor-pointer" : ""
                      )}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {visible.map((column) => (
                        <td
                          key={column.id}
                          className={cn(
                            "px-4 py-3 align-top text-sm",
                            isDark ? "text-textPrimary" : "text-slate-700",
                            column.className
                          )}
                        >
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
              className="px-4"
            />
          </div>
        </>
      )}
    </div>
  );
}
