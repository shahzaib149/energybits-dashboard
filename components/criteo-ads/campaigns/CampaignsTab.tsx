"use client";

import { useMemo } from "react";
import type { CriteoAggregatedRow, CriteoDailyRow } from "@/lib/criteo-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { aggregateByField, topByRoas } from "@/lib/criteo-ads/metrics";
import { TopCampaignsChart } from "@/components/criteo-ads/overview/OverviewTab";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { criteoCampaignColumns, criteoFilename } from "@/lib/csv/columns";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

const campaignColumns = [
  {
    id: "campaign",
    header: "Campaign",
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
    id: "ctr",
    header: "CTR",
    className: "tabular-nums",
    render: (row: CriteoAggregatedRow) => formatPercent(row.ctrPct)
  },
  {
    id: "sales",
    header: "Sales",
    className: "tabular-nums",
    render: (row: CriteoAggregatedRow) => formatCurrency(row.sales)
  },
  {
    id: "roas",
    header: "ROAS",
    className: "tabular-nums font-medium text-brand",
    render: (row: CriteoAggregatedRow) => formatRoas(row.roas)
  }
];

export function CampaignsTab({ daily, dateRange }: { daily: CriteoDailyRow[]; dateRange: DateRange }) {
  const copy = COPY.criteoAds.campaigns;
  const aggregated = useMemo(() => aggregateByField(daily, "campaignName"), [daily]);
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
      <TopCampaignsChart daily={daily} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="rounded-xl border border-border bg-surface p-6">
            <SectionHeaderRow
              title={copy.performanceTable.title}
              subtitle={copy.performanceTable.subtitle}
              actions={
                <CSVExportButton
                  data={aggregated}
                  columns={criteoCampaignColumns}
                  filename={criteoFilename("criteo-campaigns", dateRange)}
                  resourceType="criteo-ads-campaigns"
                />
              }
            />
            <PaginatedTable
              rows={aggregated}
              columns={campaignColumns}
              getRowKey={(row) => row.label}
              searchPlaceholder="Search campaigns…"
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
                      <p className="text-xs text-textMuted">
                        {formatCurrency(row.advertiserCost)} spent · {formatNumber(row.clicks)} clicks
                      </p>
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
