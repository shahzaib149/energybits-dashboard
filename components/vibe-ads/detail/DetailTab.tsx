"use client";

import { useMemo } from "react";
import type { VibeAnalyticsRow } from "@/lib/vibe-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { vibeDetailColumns, vibeFilename } from "@/lib/csv/columns";
import { formatCurrency, formatDate, formatNumber, formatRoas } from "@/lib/utils/format";

export function DetailTab({ rows, dateRange }: { rows: VibeAnalyticsRow[]; dateRange: DateRange }) {
  const copy = COPY.vibeAds.detail;
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.impressionDate.localeCompare(a.impressionDate) || b.spend - a.spend),
    [rows]
  );

  const columns = useMemo(
    () => [
      {
        id: "date",
        header: "Date",
        render: (row: VibeAnalyticsRow) => <span className="text-textSecondary">{formatDate(row.impressionDate)}</span>
      },
      {
        id: "campaign",
        header: "Campaign",
        className: "max-w-[140px] truncate font-medium text-textPrimary",
        searchValue: (row: VibeAnalyticsRow) => row.campaignName,
        render: (row: VibeAnalyticsRow) => (
          <span className="block max-w-[140px] truncate font-medium text-textPrimary" title={row.campaignName}>
            {row.campaignName}
          </span>
        )
      },
      {
        id: "channel",
        header: "Channel",
        searchValue: (row: VibeAnalyticsRow) => row.channelName,
        render: (row: VibeAnalyticsRow) => (
          <span className="block max-w-[120px] truncate text-textSecondary" title={row.channelName}>
            {row.channelName}
          </span>
        )
      },
      {
        id: "creative",
        header: "Creative",
        searchValue: (row: VibeAnalyticsRow) => row.creativeName,
        render: (row: VibeAnalyticsRow) => (
          <span className="block max-w-[120px] truncate text-textSecondary" title={row.creativeName}>
            {row.creativeName}
          </span>
        )
      },
      {
        id: "region",
        header: "Region",
        searchValue: (row: VibeAnalyticsRow) => row.geoRegion,
        render: (row: VibeAnalyticsRow) => row.geoRegion
      },
      {
        id: "screen",
        header: "Screen",
        searchValue: (row: VibeAnalyticsRow) => row.screen,
        render: (row: VibeAnalyticsRow) => row.screen
      },
      {
        id: "spend",
        header: "Spend",
        className: "tabular-nums",
        render: (row: VibeAnalyticsRow) => formatCurrency(row.spend)
      },
      {
        id: "impressions",
        header: "Impr.",
        className: "tabular-nums",
        render: (row: VibeAnalyticsRow) => formatNumber(row.impressions)
      },
      {
        id: "views",
        header: "Views",
        className: "tabular-nums",
        render: (row: VibeAnalyticsRow) => formatNumber(row.completedViews)
      },
      {
        id: "roas",
        header: "ROAS",
        className: "tabular-nums font-medium text-brand",
        render: (row: VibeAnalyticsRow) => formatRoas(row.roas)
      }
    ],
    []
  );

  if (sorted.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={copy.table.title}
        subtitle={copy.table.subtitle}
        actions={
          <CSVExportButton
            data={sorted}
            columns={vibeDetailColumns}
            filename={vibeFilename("vibe-detail", dateRange)}
            resourceType="vibe-ads-detail"
          />
        }
      />
      <PaginatedTable
        rows={sorted}
        columns={columns}
        getRowKey={(row) => row.id}
        searchPlaceholder="Search by campaign, channel, creative, region…"
      />
    </section>
  );
}
