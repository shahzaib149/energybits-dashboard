"use client";

import { useMemo } from "react";
import type { MetaAdInsightRow, MetaAggregatedRow } from "@/lib/meta-analytics/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { aggregateAdsById } from "@/lib/meta-analytics/metrics";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { metaAdColumns, metaFilename } from "@/lib/csv/columns";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";

const tableColumns = [
  {
    id: "ad",
    header: "Ad",
    searchValue: (row: MetaAggregatedRow) => row.label,
    render: (row: MetaAggregatedRow) => (
      <span className="block max-w-[240px] truncate font-medium text-textPrimary" title={row.label}>
        {row.label}
      </span>
    )
  },
  {
    id: "spend",
    header: "Spend",
    className: "tabular-nums",
    render: (row: MetaAggregatedRow) => formatCurrency(row.spend)
  },
  {
    id: "impressions",
    header: "Impressions",
    className: "tabular-nums",
    render: (row: MetaAggregatedRow) => formatNumber(row.impressions)
  },
  {
    id: "clicks",
    header: "Clicks",
    className: "tabular-nums",
    render: (row: MetaAggregatedRow) => formatNumber(row.clicks)
  },
  {
    id: "reach",
    header: "Reach",
    className: "tabular-nums",
    render: (row: MetaAggregatedRow) => formatNumber(row.reach)
  },
  {
    id: "ctr",
    header: "CTR",
    className: "tabular-nums",
    render: (row: MetaAggregatedRow) => formatPercent(row.ctrPct)
  },
  {
    id: "cpc",
    header: "CPC",
    className: "tabular-nums",
    render: (row: MetaAggregatedRow) => formatCurrency(row.cpc)
  }
];

export function AdsTab({ ads, dateRange }: { ads: MetaAdInsightRow[]; dateRange: DateRange }) {
  const copy = COPY.metaAnalytics.ads;
  const aggregated = useMemo(() => aggregateAdsById(ads), [ads]);

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
            columns={metaAdColumns}
            filename={metaFilename("ads", dateRange)}
            resourceType="meta-ads"
          />
        }
      />
      <PaginatedTable
        rows={aggregated}
        columns={tableColumns}
        getRowKey={(row) => row.id}
        searchPlaceholder="Search ads…"
      />
    </section>
  );
}
