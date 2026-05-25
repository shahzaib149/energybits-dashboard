"use client";

import { useMemo } from "react";
import type { KlaviyoAnalyticsRow } from "@/lib/klaviyo/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { klaviyoDetailColumns, klaviyoFilename } from "@/lib/csv/columns";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/format";

export function RecordsTab({ rows, dateRange }: { rows: KlaviyoAnalyticsRow[]; dateRange: DateRange }) {
  const copy = COPY.klaviyo.records;
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.date.localeCompare(a.date) || b.counts - a.counts),
    [rows]
  );

  const columns = useMemo(
    () => [
      {
        id: "date",
        header: "Date",
        render: (row: KlaviyoAnalyticsRow) => <span className="text-textSecondary">{formatDate(row.date)}</span>
      },
      {
        id: "metric",
        header: "Metric",
        className: "max-w-[180px] truncate font-medium text-textPrimary",
        searchValue: (row: KlaviyoAnalyticsRow) => row.metricName,
        render: (row: KlaviyoAnalyticsRow) => (
          <span className="block max-w-[180px] truncate font-medium text-textPrimary" title={row.metricName}>
            {row.metricName}
          </span>
        )
      },
      {
        id: "counts",
        header: "Events",
        className: "tabular-nums",
        render: (row: KlaviyoAnalyticsRow) => formatNumber(row.counts)
      },
      {
        id: "unique",
        header: "Unique",
        className: "tabular-nums",
        render: (row: KlaviyoAnalyticsRow) => formatNumber(row.uniqueCounts)
      },
      {
        id: "revenue",
        header: "Order value",
        className: "tabular-nums",
        render: (row: KlaviyoAnalyticsRow) => formatCurrency(row.orderSumValue)
      },
      {
        id: "metricId",
        header: "Metric ID",
        className: "max-w-[120px] truncate text-xs text-textMuted",
        searchValue: (row: KlaviyoAnalyticsRow) => row.metricId,
        render: (row: KlaviyoAnalyticsRow) => (
          <span className="block max-w-[120px] truncate text-xs text-textMuted" title={row.metricId}>
            {row.metricId}
          </span>
        )
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
            columns={klaviyoDetailColumns}
            filename={klaviyoFilename("klaviyo-records", dateRange)}
            resourceType="klaviyo-records"
          />
        }
      />
      <PaginatedTable
        rows={sorted}
        columns={columns}
        getRowKey={(row) => row.id}
        searchPlaceholder="Search by metric name or ID…"
      />
    </section>
  );
}
