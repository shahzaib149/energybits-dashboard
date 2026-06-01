"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import type { BlogPipelineRow, BlogStatus } from "@/lib/airtable/blog-pipeline";
import { isBlogProcessing } from "@/lib/blog-pipeline/processing";
import { COPY } from "@/lib/copy";
import { StatusBadge } from "@/components/blog-pipeline/StatusBadge";
import { PipelineStatusFilters, StatusCountPills } from "@/components/blog-pipeline/PipelineStatusFilters";
import { TopicActions } from "@/components/blog-pipeline/TopicActions";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { TablePagination } from "@/components/ui/TablePagination";
import { TableSearch } from "@/components/ui/TableSearch";
import { usePagination } from "@/hooks/usePagination";
import { blogPipelineColumns, staticFilename } from "@/lib/csv/columns";
import { formatRelativeTime } from "@/lib/utils/format";

function countByStatus(rows: BlogPipelineRow[]) {
  return {
    creating: rows.filter((r) => isBlogProcessing(r)).length,
    ready: rows.filter((r) => r.blogStatus === "Ready" && !isBlogProcessing(r)).length,
    drafting: rows.filter((r) => r.blogStatus === "Draft Generated").length,
    review: rows.filter((r) =>
      ["Needs Review", "Revision Needed", "Approved", "Image Ready"].includes(r.blogStatus)
    ).length,
    published: rows.filter((r) => ["Published", "Shopify Draft Created", "Scheduled"].includes(r.blogStatus)).length
  };
}

export function PipelineStatusTable({
  rows,
  canEdit,
  onSubmitted
}: {
  rows: BlogPipelineRow[];
  canEdit: boolean;
  onSubmitted?: (row: BlogPipelineRow) => void;
}) {
  const copy = COPY.blogPipeline;
  const [filter, setFilter] = useState<BlogStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();
  const [optimisticRows, dispatch] = useOptimistic(
    rows,
    (
      state,
      action: { type: "delete"; id: string } | { type: "update"; row: BlogPipelineRow }
    ) => {
      if (action.type === "delete") return state.filter((r) => r.id !== action.id);
      return state.map((r) => (r.id === action.row.id ? action.row : r));
    }
  );

  const filtered =
    filter === "all" ? optimisticRows : optimisticRows.filter((r) => r.blogStatus === filter);

  const searched = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return filtered;
    }

    return filtered.filter((row) =>
      [row.blogTitle, row.submittedBy, row.blogStatus].some((value) => value?.toLowerCase().includes(query))
    );
  }, [filtered, search]);

  const { paginatedItems, page, setPage, pageSize, setPageSize, totalPages, totalRows } = usePagination(searched, {
    resetDeps: [search, filter, optimisticRows.length]
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-4">
          <StatusCountPills counts={countByStatus(optimisticRows)} />
          <PipelineStatusFilters value={filter} onChange={setFilter} />
        </div>
        <CSVExportButton
          data={filtered}
          columns={blogPipelineColumns}
          filename={staticFilename("blog-pipeline")}
          resourceType="blog-pipeline"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-textSecondary">{copy.empty}</p>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-6">
          {optimisticRows.length >= 8 ? (
            <TableSearch value={search} onChange={setSearch} placeholder="Search by title, submitter, or status…" />
          ) : null}
          <div className="overflow-x-auto rounded-lg ring-1 ring-border/40">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-[1] bg-surface">
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
                  <th className="px-4 py-3">{copy.columns.title}</th>
                  <th className="px-4 py-3">{copy.columns.status}</th>
                  <th className="px-4 py-3">{copy.columns.submittedBy}</th>
                  <th className="px-4 py-3">{copy.columns.submittedAt}</th>
                  <th className="px-4 py-3">{copy.columns.updatedAt}</th>
                  <th className="px-4 py-3">{copy.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-textMuted">
                      No rows match your search.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 transition-colors even:bg-surfaceElevated/20 hover:bg-surfaceElevated/60">
                      <td className="px-4 py-3 font-medium text-textPrimary">
                        <Link href={`/blog-pipeline/${row.id}/preview`} className="hover:text-brand">
                          {row.blogTitle || "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.blogStatus} processing={isBlogProcessing(row)} />
                        {isBlogProcessing(row) ? (
                          <p className="mt-1 text-xs text-cyan-400">{copy.creatingHint}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-textSecondary">{row.submittedBy || "—"}</td>
                      <td className="px-4 py-3 text-textMuted" title={row.createdTime}>
                        {row.createdTime ? formatRelativeTime(row.createdTime) : "—"}
                      </td>
                      <td className="px-4 py-3 text-textMuted" title={row.lastModified}>
                        {row.lastModified ? formatRelativeTime(row.lastModified) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <TopicActions
                          row={row}
                          canEdit={canEdit}
                          onDeleted={(id) => startTransition(() => dispatch({ type: "delete", id }))}
                          onUpdated={(updated) => startTransition(() => dispatch({ type: "update", row: updated }))}
                        />
                      </td>
                    </tr>
                  ))
                )}
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
          />
        </div>
      )}
    </div>
  );
}
