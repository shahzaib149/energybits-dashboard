"use client";

import { useCallback, useEffect, useState } from "react";
import type { BlogPipelineRow } from "@/lib/airtable/blog-pipeline";
import { hasProcessingBlogs } from "@/lib/blog-pipeline/processing";
import { PipelineStatusTable } from "@/components/blog-pipeline/PipelineStatusTable";
import { SubmitTopicButton } from "@/components/blog-pipeline/SubmitTopicButton";
import { COPY } from "@/lib/copy";

const POLL_MS = 8_000;

export function BlogPipelineStatusView({
  initialRows,
  canEdit
}: {
  initialRows: BlogPipelineRow[];
  canEdit: boolean;
}) {
  const copy = COPY.blogPipeline;
  const [rows, setRows] = useState(initialRows);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const refreshRows = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setRefreshing(true);
    try {
      const res = await fetch("/api/blog-pipeline", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { rows?: BlogPipelineRow[] };
      if (data.rows) {
        setRows(data.rows);
      }
    } catch {
      // Keep showing last good data
    } finally {
      if (!opts?.silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!hasProcessingBlogs(rows)) return;
    const timer = window.setInterval(() => {
      void refreshRows({ silent: true });
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [rows, refreshRows]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Workflow</p>
          <h1 className="mt-1 text-2xl font-semibold text-textPrimary">{copy.title}</h1>
          <p className="mt-1 text-sm text-textSecondary">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {refreshing ? <span className="text-xs text-textMuted">{copy.refreshing}</span> : null}
          <button
            type="button"
            onClick={() => void refreshRows()}
            className="rounded-lg border border-border px-3 py-2 text-sm text-textSecondary hover:bg-surfaceElevated"
          >
            {copy.refresh}
          </button>
          {canEdit && <SubmitTopicButton onSubmitted={() => void refreshRows()} />}
        </div>
      </header>

      <PipelineStatusTable rows={rows} canEdit={canEdit} />
    </div>
  );
}
