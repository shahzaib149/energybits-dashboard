"use client";

import { useMemo } from "react";
import type { KlaviyoAnalyticsRow } from "@/lib/klaviyo/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { aggregateByMetricName } from "@/lib/klaviyo/metrics";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { klaviyoFilename, klaviyoMetricColumns } from "@/lib/csv/columns";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export function MetricsTab({ rows, dateRange }: { rows: KlaviyoAnalyticsRow[]; dateRange: DateRange }) {
  const copy = COPY.klaviyo.metricsTab;
  const aggregated = useMemo(() => aggregateByMetricName(rows), [rows]);

  const columns = useMemo(
    () => [
      {
        id: "metric",
        header: "Metric",
        className: "max-w-[220px] truncate font-medium text-textPrimary",
        searchValue: (row: (typeof aggregated)[number]) => row.metricName,
        render: (row: (typeof aggregated)[number]) => (
          <span className="block max-w-[220px] truncate font-medium text-textPrimary" title={row.metricName}>
            {row.metricName}
          </span>
        )
      },
      {
        id: "counts",
        header: "Events",
        className: "tabular-nums",
        render: (row: (typeof aggregated)[number]) => formatNumber(row.counts)
      },
      {
        id: "unique",
        header: "Unique contacts",
        className: "tabular-nums",
        render: (row: (typeof aggregated)[number]) => formatNumber(row.uniqueCounts)
      },
      {
        id: "revenue",
        header: "Order value",
        className: "tabular-nums font-medium text-brand",
        render: (row: (typeof aggregated)[number]) => formatCurrency(row.orderSumValue)
      },
      {
        id: "records",
        header: "Rows",
        className: "tabular-nums text-textSecondary",
        render: (row: (typeof aggregated)[number]) => formatNumber(row.recordCount)
      }
    ],
    []
  );

  if (aggregated.length === 0) {
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
            data={aggregated}
            columns={klaviyoMetricColumns}
            filename={klaviyoFilename("klaviyo-metrics", dateRange)}
            resourceType="klaviyo-metrics"
          />
        }
      />
      <PaginatedTable
        rows={aggregated}
        columns={columns}
        getRowKey={(row) => row.metricName}
        searchPlaceholder="Search by metric name…"
      />
    </section>
  );
}
