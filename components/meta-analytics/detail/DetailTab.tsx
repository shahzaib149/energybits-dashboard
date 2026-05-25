"use client";

import type { MetaAdInsightRow } from "@/lib/meta-analytics/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { metaAdInsightColumns, metaFilename } from "@/lib/csv/columns";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/utils/format";

const tableColumns = [
  {
    id: "ad",
    header: "Ad",
    searchValue: (row: MetaAdInsightRow) => `${row.adName} ${row.adId}`,
    render: (row: MetaAdInsightRow) => (
      <div className="max-w-[220px]">
        <p className="truncate font-medium text-textPrimary" title={row.adName}>
          {row.adName || "—"}
        </p>
        {row.adLink ? (
          <a
            href={row.adLink}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-xs text-[#4599FF] hover:underline"
          >
            View in Ads Manager
          </a>
        ) : null}
      </div>
    )
  },
  {
    id: "date",
    header: "Date",
    className: "tabular-nums whitespace-nowrap",
    render: (row: MetaAdInsightRow) => formatDate(row.dateStart)
  },
  {
    id: "spend",
    header: "Spend",
    className: "tabular-nums",
    render: (row: MetaAdInsightRow) => formatCurrency(row.spend)
  },
  {
    id: "impressions",
    header: "Impressions",
    className: "tabular-nums",
    render: (row: MetaAdInsightRow) => formatNumber(row.impressions)
  },
  {
    id: "clicks",
    header: "Clicks",
    className: "tabular-nums",
    render: (row: MetaAdInsightRow) => formatNumber(row.clicks)
  },
  {
    id: "ctr",
    header: "CTR",
    className: "tabular-nums",
    render: (row: MetaAdInsightRow) => formatPercent(row.ctrPct)
  },
  {
    id: "cpc",
    header: "CPC",
    className: "tabular-nums",
    render: (row: MetaAdInsightRow) => formatCurrency(row.cpc)
  },
  {
    id: "ranking",
    header: "Conv. ranking",
    render: (row: MetaAdInsightRow) => (
      <span className="text-textSecondary">{row.conversionRateRanking || "—"}</span>
    )
  }
];

export function DetailTab({ ads, dateRange }: { ads: MetaAdInsightRow[]; dateRange: DateRange }) {
  const copy = COPY.metaAnalytics.detail;

  if (ads.length === 0) {
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
            data={ads}
            columns={metaAdInsightColumns}
            filename={metaFilename("ad-insights", dateRange)}
            resourceType="meta-ad-insights"
          />
        }
      />
      <PaginatedTable
        rows={ads}
        columns={tableColumns}
        getRowKey={(row) => row.id}
        searchPlaceholder="Search ad insights…"
      />
    </section>
  );
}
