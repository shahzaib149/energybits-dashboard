"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import type { BlogPipelineRow, BlogStatus } from "@/lib/airtable/blog-pipeline";
import { COPY } from "@/lib/copy";
import { StatusBadge } from "@/components/blog-pipeline/StatusBadge";
import { PipelineStatusFilters, StatusCountPills } from "@/components/blog-pipeline/PipelineStatusFilters";
import { TopicActions } from "@/components/blog-pipeline/TopicActions";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { blogPipelineColumns, staticFilename } from "@/lib/csv/columns";
import { formatRelativeTime } from "@/lib/utils/format";

function countByStatus(rows: BlogPipelineRow[]) {
  return {
    ready: rows.filter((r) => r.blogStatus === "Ready").length,
    drafting: rows.filter((r) => r.blogStatus === "Draft Generated").length,
    review: rows.filter((r) =>
      ["Needs Review", "Revision Needed", "Approved", "Image Ready"].includes(r.blogStatus)
    ).length,
    published: rows.filter((r) => ["Published", "Shopify Draft Created", "Scheduled"].includes(r.blogStatus)).length
  };
}

export function PipelineStatusTable({
  initialRows,
  canEdit
}: {
  initialRows: BlogPipelineRow[];
  canEdit: boolean;
}) {
  const copy = COPY.blogPipeline;
  const [filter, setFilter] = useState<BlogStatus | "all">("all");
  const [, startTransition] = useTransition();
  const [optimisticRows, dispatch] = useOptimistic(
    initialRows,
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
          <Link
            href="/blog-pipeline"
            className="mt-4 inline-block rounded-lg bg-brand/15 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/25"
          >
            {copy.submitCta}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead>
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
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-medium text-textPrimary">
                    <Link href={`/blog-pipeline/${row.id}/preview`} className="hover:text-brand">
                      {row.blogTitle || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.blogStatus} />
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
