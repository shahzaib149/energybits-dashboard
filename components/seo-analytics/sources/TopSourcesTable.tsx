"use client";

import { useMemo } from "react";
import type { GA4SourceRow } from "@/lib/airtable/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { channelColor } from "@/lib/seo-analytics/metrics";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
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
  const rows = useMemo(() => [...sources].sort((a, b) => b.sessions - a.sessions), [sources]);

  const columns = useMemo(
    () => [
      {
        id: "source",
        header: "Source",
        searchValue: (row: GA4SourceRow) => row.source,
        className: "font-medium text-textPrimary",
        render: (row: GA4SourceRow) => row.source
      },
      {
        id: "medium",
        header: "Medium",
        searchValue: (row: GA4SourceRow) => row.medium,
        render: (row: GA4SourceRow) => row.medium
      },
      {
        id: "channel",
        header: "Channel",
        searchValue: (row: GA4SourceRow) => row.channelGroup,
        render: (row: GA4SourceRow) => (
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
        )
      },
      {
        id: "sessions",
        header: "Sessions",
        className: "tabular-nums",
        render: (row: GA4SourceRow) => formatNumber(row.sessions)
      },
      {
        id: "engagement",
        header: "Engagement Rate",
        className: "tabular-nums",
        render: (row: GA4SourceRow) => formatPercent(row.engagementRatePct)
      },
      {
        id: "duration",
        header: "Avg Duration",
        className: "tabular-nums",
        render: (row: GA4SourceRow) => formatDuration(row.averageSessionDuration)
      }
    ],
    []
  );

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
        <PaginatedTable rows={rows} columns={columns} getRowKey={(row) => row.id} searchPlaceholder="Search sources…" />
      )}
    </section>
  );
}
