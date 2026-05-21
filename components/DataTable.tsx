"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, EyeOff } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
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
}

export function DataTable<T>({
  title,
  rows,
  columns,
  getRowId,
  searchPlaceholder = "Search records...",
  toolbar,
  onRowClick,
  showColumnToggle = true
}: DataTableProps<T>) {
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

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className={cn("relative w-full", showColumnToggle ? "sm:max-w-md" : "")}>
              <TableSearch value={search} onChange={setSearch} placeholder={searchPlaceholder} variant="light" className="max-w-none" />
            </div>
            {showColumnToggle ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowColumns((current) => !current)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Columns
                </button>
                {showColumns ? (
                  <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-soft sm:left-auto sm:right-0 sm:w-60">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      <EyeOff className="h-3.5 w-3.5" />
                      Visibility
                    </div>
                    <div className="space-y-2">
                      {columns.map((column) => (
                        <label key={column.id} className="flex items-center gap-3 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(column.id)}
                            onChange={() => toggleColumn(column.id)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
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
        <EmptyState title={`No ${title.toLowerCase()} matched`} />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {paginatedItems.map((row) => (
              <article
                key={getRowId(row)}
                className={cn("card p-4", onRowClick ? "cursor-pointer active:bg-slate-50" : "")}
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
                  <div key={column.id} className={index === 0 ? "" : "mt-3 border-t border-slate-100 pt-3"}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{column.label}</p>
                    <div className="mt-1 text-sm text-slate-700">{column.render(row)}</div>
                  </div>
                ))}
              </article>
            ))}
            <div className="card overflow-hidden px-4">
              <TablePagination
                currentPage={page}
                totalPages={totalPages}
                totalRows={totalRows}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                variant="light"
              />
            </div>
          </div>

          <div className="table-shell hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    {visible.map((column) => (
                      <th
                        key={column.id}
                        className={cn(
                          "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                          column.className
                        )}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedItems.map((row) => (
                    <tr
                      key={getRowId(row)}
                      className={cn("transition hover:bg-slate-50", onRowClick ? "cursor-pointer" : "")}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {visible.map((column) => (
                        <td key={column.id} className={cn("px-4 py-3 align-top text-sm text-slate-700", column.className)}>
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
              variant="light"
              className="px-4"
            />
          </div>
        </>
      )}
    </div>
  );
}
