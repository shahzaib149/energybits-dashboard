"use client";

import { useState } from "react";
import type { GA4PageRow } from "@/lib/airtable/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { ga4PageColumns, seoFilename } from "@/lib/csv/columns";
import { cn } from "@/lib/utils";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils/format";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

function pagePath(row: GA4PageRow): string {
  return row.pagePath || "/";
}

function bounceBadge(rate: number): { label: string; class: string } {
  if (rate >= 75) return { label: "Critical", class: "bg-red-500/15 text-red-400" };
  if (rate >= 60) return { label: "High", class: "bg-amber-500/15 text-amber-400" };
  return { label: "Moderate", class: "bg-yellow-500/15 text-yellow-400" };
}

export function PoorPerformancePages({
  rows,
  dateRange
}: {
  rows: GA4PageRow[];
  dateRange: DateRange;
}) {
  const [page, setPage] = useState(1);
  const copy = COPY.seoAnalytics.pages.poorPerformance;

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <CSVExportButton
            data={rows}
            columns={ga4PageColumns}
            filename={seoFilename("poor-performance-pages", dateRange)}
            resourceType="ga4-poor-performance"
          />
        }
      />

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border/60">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surfaceElevated/50 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">
                  <th className="px-4 py-3 w-8">#</th>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3 text-right">Sessions</th>
                  <th className="px-4 py-3 text-right">Engagement</th>
                  <th className="px-4 py-3 text-right">Avg Duration</th>
                  <th className="px-4 py-3 text-right">Bounce Rate</th>
                  <th className="px-4 py-3 text-center">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {visible.map((row, i) => {
                  const badge = bounceBadge(row.bounceRatePct);
                  const rank = start + i + 1;
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-surfaceElevated/40">
                      <td className="px-4 py-3 text-xs tabular-nums text-textMuted">{rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="max-w-xs truncate font-medium text-textPrimary" title={pagePath(row)}>
                            {pagePath(row)}
                          </span>
                          {row.pageTitle ? (
                            <span className="max-w-xs truncate text-xs text-textMuted" title={row.pageTitle}>
                              {row.pageTitle}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-textSecondary">
                        {formatNumber(row.sessions)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-textSecondary">
                        {formatPercent(row.engagementRatePct)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-textSecondary">
                        {formatDuration(row.averageSessionDuration)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right tabular-nums font-medium",
                          row.bounceRatePct >= 75 ? "text-red-400" : row.bounceRatePct >= 60 ? "text-amber-400" : "text-yellow-400"
                        )}
                      >
                        {formatPercent(row.bounceRatePct)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.class}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-xs text-textMuted">
            <span>
              Showing {start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length} pages
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surfaceElevated transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surfaceElevated transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
