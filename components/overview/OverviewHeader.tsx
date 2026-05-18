"use client";

import { useRouter } from "next/navigation";
import { Download, ExternalLink, RefreshCw } from "lucide-react";
import { useTransition } from "react";
import type { RunSummary } from "@/lib/cairrot/types";
import { formatDateTime } from "@/lib/utils/format";
import { refreshCairrotData } from "@/app/overview/actions";

export interface OverviewHeaderProps {
  runId: string;
  createdAt: string;
  runs: RunSummary[];
  exportPayload: Record<string, unknown>;
  fetchedAt: string;
  projectUrl?: string;
}

export function OverviewHeader({
  runId,
  createdAt,
  runs,
  exportPayload,
  fetchedAt,
  projectUrl
}: OverviewHeaderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onRunChange(nextRunId: string) {
    const params = new URLSearchParams();
    if (nextRunId) {
      params.set("runId", nextRunId);
    }
    router.push(`/overview?${params.toString()}`);
  }

  function onExport() {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `energybits-run-${runId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function onRefresh() {
    startTransition(async () => {
      await refreshCairrotData(runId);
      router.refresh();
    });
  }

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Visibility · Run Overview</p>
        <h1 className="mt-1 text-2xl font-semibold text-textPrimary lg:text-3xl">AI visibility performance</h1>
        <p className="mt-1 text-sm text-textSecondary">
          {projectUrl ? (
            <>
              <span className="font-medium text-textPrimary">{projectUrl}</span>
              <span className="mx-1.5 text-border">·</span>
            </>
          ) : null}
          Run {runId.slice(0, 8)}… · {formatDateTime(createdAt)}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-textMuted">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 font-medium text-brand">
            Live · Cairrot API
          </span>
          <span>Server fetched {formatDateTime(fetchedAt)}</span>
          <a
            href={`/api/cairrot/dashboard?runId=${encodeURIComponent(runId)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-brand hover:text-brandHover"
          >
            View raw JSON
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
        <label className="sr-only" htmlFor="run-selector">
          Select run
        </label>
        <select
          id="run-selector"
          value={runId}
          onChange={(event) => onRunChange(event.target.value)}
          className="w-full rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-sm text-textPrimary sm:w-auto sm:min-w-[220px]"
        >
          {runs.map((run) => (
            <option key={run.runId} value={run.runId}>
              {formatDateTime(run.startedAt)} · {run.status}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRefresh}
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-sm text-textPrimary hover:border-borderHover disabled:opacity-60 sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-background hover:bg-brandHover sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </button>
      </div>
    </header>
  );
}
