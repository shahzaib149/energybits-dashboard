"use client";

import { useMemo } from "react";
import type { MetaAggregatedRow, MetaCampaignRow } from "@/lib/meta-analytics/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { aggregateCampaignsById } from "@/lib/meta-analytics/metrics";
import { TopCampaignsChart } from "@/components/meta-analytics/overview/OverviewTab";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { metaCampaignColumns, metaFilename } from "@/lib/csv/columns";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";

const tableColumns = [
  {
    id: "campaign",
    header: "Campaign",
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
  },
  {
    id: "cpm",
    header: "CPM",
    className: "tabular-nums",
    render: (row: MetaAggregatedRow) => formatCurrency(row.cpm)
  }
];

export function CampaignsTab({
  campaigns,
  dateRange
}: {
  campaigns: MetaCampaignRow[];
  dateRange: DateRange;
}) {
  const copy = COPY.metaAnalytics.campaigns;
  const aggregated = useMemo(() => aggregateCampaignsById(campaigns), [campaigns]);

  if (aggregated.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <TopCampaignsChart campaigns={campaigns} />
      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionHeaderRow
          title={copy.table.title}
          subtitle={copy.table.subtitle}
          actions={
            <CSVExportButton
              data={aggregated}
              columns={metaCampaignColumns}
              filename={metaFilename("campaigns", dateRange)}
              resourceType="meta-campaigns"
            />
          }
        />
        <PaginatedTable
          rows={aggregated}
          columns={tableColumns}
          getRowKey={(row) => row.id}
          searchPlaceholder="Search campaigns…"
        />
      </section>
    </div>
  );
}
