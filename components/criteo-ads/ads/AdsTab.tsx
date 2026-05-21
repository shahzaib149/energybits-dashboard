"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CriteoAggregatedRow, CriteoDailyRow } from "@/lib/criteo-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { aggregateByField, topByRoas } from "@/lib/criteo-ads/metrics";
import { CRITEO_CHART_COLORS, criteoChartAxisProps } from "@/components/criteo-ads/chartTheme";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { criteoAdColumns, criteoFilename } from "@/lib/csv/columns";
import { formatCurrency, formatCurrencyCompact, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

function truncateLabel(label: string, max = 32): string {
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

const adColumns = [
  {
    id: "ad",
    header: "Ad",
    searchValue: (row: CriteoAggregatedRow) => row.label,
    render: (row: CriteoAggregatedRow) => (
      <span className="block max-w-[220px] truncate font-medium text-textPrimary" title={row.label}>
        {row.label}
      </span>
    )
  },
  {
    id: "spend",
    header: "Spend",
    className: "tabular-nums",
    render: (row: CriteoAggregatedRow) => formatCurrency(row.advertiserCost)
  },
  {
    id: "clicks",
    header: "Clicks",
    className: "tabular-nums",
    render: (row: CriteoAggregatedRow) => formatNumber(row.clicks)
  },
  {
    id: "displays",
    header: "Displays",
    className: "tabular-nums",
    render: (row: CriteoAggregatedRow) => formatNumber(row.displays)
  },
  {
    id: "cpc",
    header: "CPC",
    className: "tabular-nums",
    render: (row: CriteoAggregatedRow) => formatCurrency(row.cpc)
  },
  {
    id: "revenue",
    header: "Revenue",
    className: "tabular-nums",
    render: (row: CriteoAggregatedRow) => formatCurrency(row.revenue)
  },
  {
    id: "roas",
    header: "ROAS",
    className: "tabular-nums font-medium text-brand",
    render: (row: CriteoAggregatedRow) => formatRoas(row.roas)
  }
];

function TopAdsChart({ daily }: { daily: CriteoDailyRow[] }) {
  const copy = COPY.criteoAds.ads.topSpend;
  const data = aggregateByField(daily, "ad")
    .slice(0, 10)
    .map((row) => ({
      name: truncateLabel(row.label),
      fullName: row.label,
      cost: row.advertiserCost,
      roas: row.roas
    }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CRITEO_CHART_COLORS.grid} horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => formatCurrencyCompact(v)} {...criteoChartAxisProps} />
            <YAxis type="category" dataKey="name" width={140} {...criteoChartAxisProps} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div
                    style={{
                      background: CRITEO_CHART_COLORS.surface,
                      border: `1px solid ${CRITEO_CHART_COLORS.grid}`,
                      borderRadius: 8,
                      padding: 12
                    }}
                    className="text-xs"
                  >
                    <p className="font-medium text-white">{row.fullName}</p>
                    <p className="text-textSecondary">Spend: {formatCurrency(row.cost)}</p>
                    <p className="text-textSecondary">ROAS: {formatRoas(row.roas)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="cost" fill={CRITEO_CHART_COLORS.secondary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function AdsTab({ daily, dateRange }: { daily: CriteoDailyRow[]; dateRange: DateRange }) {
  const copy = COPY.criteoAds.ads;
  const aggregated = useMemo(() => aggregateByField(daily, "ad"), [daily]);
  const topRoas = useMemo(() => topByRoas(aggregated, 5, 5), [aggregated]);

  if (aggregated.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <TopAdsChart daily={daily} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="rounded-xl border border-border bg-surface p-6">
            <SectionHeaderRow
              title={copy.performanceTable.title}
              subtitle={copy.performanceTable.subtitle}
              actions={
                <CSVExportButton
                  data={aggregated}
                  columns={criteoAdColumns}
                  filename={criteoFilename("criteo-ads", dateRange)}
                  resourceType="criteo-ads-ads"
                />
              }
            />
            <PaginatedTable
              rows={aggregated}
              columns={adColumns}
              getRowKey={(row) => row.label}
              searchPlaceholder="Search ads…"
            />
          </section>
        </div>
        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={copy.topRoas.title} subtitle={copy.topRoas.subtitle} />
          {topRoas.length === 0 ? (
            <p className="text-sm text-textMuted">{copy.topRoas.empty}</p>
          ) : (
            <div className="space-y-3">
              {topRoas.map((row, index) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-surfaceElevated px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-textPrimary">{row.label}</p>
                      <p className="text-xs text-textMuted">{formatCurrency(row.advertiserCost)} spent</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-lg font-bold tabular-nums text-brand">{formatRoas(row.roas)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
