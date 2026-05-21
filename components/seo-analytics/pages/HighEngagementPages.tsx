"use client";

import type { GA4PageRow } from "@/lib/airtable/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { ga4PageColumns, seoFilename } from "@/lib/csv/columns";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils/format";

export function HighEngagementPages({
  rows,
  dateRange
}: {
  rows: GA4PageRow[];
  dateRange: DateRange;
}) {
  const copy = COPY.seoAnalytics.pages.highEngagement;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={`🏆 ${copy.title}`}
        subtitle={copy.subtitle}
        actions={
          <CSVExportButton
            data={rows}
            columns={ga4PageColumns}
            filename={seoFilename("high-engagement-pages", dateRange)}
            resourceType="ga4-high-engagement"
          />
        }
      />
      {rows.length === 0 ? (
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
                <th className="py-2 pr-3">Page</th>
                <th className="py-2 pr-3">Sessions</th>
                <th className="py-2 pr-3">Engagement Rate</th>
                <th className="py-2 pr-3">Avg Session Duration</th>
                <th className="py-2">Views</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="max-w-[200px] truncate py-3 pr-3 font-medium text-textPrimary" title={row.pagePath}>
                    {row.pagePath || "/"}
                  </td>
                  <td className="py-3 pr-3 tabular-nums">{formatNumber(row.sessions)}</td>
                  <td className="py-3 pr-3 tabular-nums text-brand">{formatPercent(row.engagementRatePct)}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatDuration(row.averageSessionDuration)}</td>
                  <td className="py-3 tabular-nums">{formatNumber(row.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
