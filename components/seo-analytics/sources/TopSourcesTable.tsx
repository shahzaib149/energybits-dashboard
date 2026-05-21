"use client";

import type { GA4SourceRow } from "@/lib/airtable/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { channelColor } from "@/lib/seo-analytics/metrics";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { ga4SourceColumns, seoFilename } from "@/lib/csv/columns";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils/format";

export function TopSourcesTable({
  sources,
  dateRange
}: {
  sources: GA4SourceRow[];
  dateRange: DateRange;
}) {
  const copy = COPY.seoAnalytics.sources.topSources;
  const rows = [...sources].sort((a, b) => b.sessions - a.sessions);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <CSVExportButton
            data={rows}
            columns={ga4SourceColumns}
            filename={seoFilename("top-sources", dateRange)}
            resourceType="ga4-top-sources"
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
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Medium</th>
                <th className="py-2 pr-3">Channel</th>
                <th className="py-2 pr-3">Sessions</th>
                <th className="py-2 pr-3">Engagement Rate</th>
                <th className="py-2">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 15).map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="py-3 pr-3 font-medium text-textPrimary">{row.source}</td>
                  <td className="py-3 pr-3 text-textSecondary">{row.medium}</td>
                  <td className="py-3 pr-3">
                    <span
                      className="inline-flex rounded-md border px-2 py-0.5 text-xs font-medium"
                      style={{
                        borderColor: `${channelColor(row.channelGroup)}40`,
                        backgroundColor: `${channelColor(row.channelGroup)}15`,
                        color: channelColor(row.channelGroup)
                      }}
                    >
                      {row.channelGroup}
                    </span>
                  </td>
                  <td className="py-3 pr-3 tabular-nums">{formatNumber(row.sessions)}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatPercent(row.engagementRatePct)}</td>
                  <td className="py-3 tabular-nums">{formatDuration(row.averageSessionDuration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
