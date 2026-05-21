"use client";

import { useEffect, useMemo, useState } from "react";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

export function usePagination<T>(
  items: T[],
  options?: {
    pageSize?: number;
    resetDeps?: unknown[];
  }
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options?.pageSize ?? DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [pageSize, ...(options?.resetDeps ?? [])]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize]
  );

  return {
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalRows: items.length,
    paginatedItems,
    goPrev: () => setPage((current) => Math.max(1, current - 1)),
    goNext: () => setPage((current) => Math.min(totalPages, current + 1)),
    goFirst: () => setPage(1),
    goLast: () => setPage(totalPages)
  };
}
