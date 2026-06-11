"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { MetaAdInsightRow, MetaAggregatedRow } from "@/lib/meta-analytics/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { aggregateAdsById } from "@/lib/meta-analytics/metrics";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { metaAdColumns, metaFilename } from "@/lib/csv/columns";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";

// ─── Table columns ────────────────────────────────────────────────────────────

const columns = [
  {
    id: "ad",
    header: "Ad",
    searchValue: (row: MetaAggregatedRow) => row.label,
    render: (row: MetaAggregatedRow) => (
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={`/meta-analytics/ad-detail?name=${encodeURIComponent(row.label)}`}
          className="block max-w-[200px] truncate font-medium text-brand hover:underline"
          title={row.label}
        >
          {row.label}
        </Link>
        {row.adLink && (
          <a
            href={row.adLink}
            target="_blank"
            rel="noopener noreferrer"
            title="View ad"
            className="shrink-0 text-textMuted hover:text-textPrimary"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h4a.75.75 0 0 1 0 1.5h-4Zm6.5-1a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-4.72 4.72a.75.75 0 0 1-1.06-1.06l4.72-4.72h-2.69a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </a>
        )}
      </div>
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

// ─── Component ────────────────────────────────────────────────────────────────

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
    <section className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-6">
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
          columns={columns}
          getRowKey={(row) => row.id}
          searchPlaceholder="Search ads…"
        />
      </div>
    </section>
  );
}
