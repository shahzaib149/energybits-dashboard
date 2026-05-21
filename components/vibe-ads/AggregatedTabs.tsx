"use client";

import { useMemo } from "react";
import type { VibeAggregatedRow } from "@/lib/vibe-ads/types";
import type { VibeAnalyticsRow } from "@/lib/vibe-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { aggregateByField, topByRoas } from "@/lib/vibe-ads/metrics";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { vibeAggregatedColumns, vibeFilename } from "@/lib/csv/columns";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

const aggregatedColumns = [
  {
    id: "name",
    header: "Name",
    className: "max-w-[220px] truncate font-medium text-textPrimary",
    searchValue: (row: VibeAggregatedRow) => row.label,
    render: (row: VibeAggregatedRow) => (
      <span className="block max-w-[220px] truncate font-medium text-textPrimary" title={row.label}>
        {row.label}
      </span>
    )
  },
  {
    id: "spend",
    header: "Spend",
    className: "tabular-nums",
    render: (row: VibeAggregatedRow) => formatCurrency(row.spend)
  },
  {
    id: "impressions",
    header: "Impressions",
    className: "tabular-nums",
    render: (row: VibeAggregatedRow) => formatNumber(row.impressions)
  },
  {
    id: "views",
    header: "Completed views",
    className: "tabular-nums",
    render: (row: VibeAggregatedRow) => formatNumber(row.completedViews)
  },
  {
    id: "households",
    header: "Households",
    className: "tabular-nums",
    render: (row: VibeAggregatedRow) => formatNumber(row.households)
  },
  {
    id: "cpm",
    header: "CPM",
    className: "tabular-nums",
    render: (row: VibeAggregatedRow) => formatCurrency(row.cpm)
  },
  {
    id: "vtr",
    header: "VTR",
    className: "tabular-nums",
    render: (row: VibeAggregatedRow) => formatPercent(row.viewThroughRatePct)
  },
  {
    id: "roas",
    header: "ROAS",
    className: "tabular-nums font-medium text-brand",
    render: (row: VibeAggregatedRow) => formatRoas(row.roas)
  }
];

function AggregatedTab({
  rows,
  dateRange,
  field,
  title,
  subtitle,
  slug,
  resourceType
}: {
  rows: VibeAnalyticsRow[];
  dateRange: DateRange;
  field: "campaignName" | "channelName" | "creativeName";
  title: string;
  subtitle: string;
  slug: string;
  resourceType: string;
}) {
  const aggregated = useMemo(() => aggregateByField(rows, field), [rows, field]);
  const topRoas = useMemo(() => topByRoas(aggregated), [aggregated]);

  if (aggregated.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionHeaderRow
          title={title}
          subtitle={subtitle}
          actions={
            <CSVExportButton
              data={aggregated}
              columns={vibeAggregatedColumns}
              filename={vibeFilename(slug, dateRange)}
              resourceType={resourceType}
            />
          }
        />
        <PaginatedTable
          rows={aggregated}
          columns={aggregatedColumns}
          getRowKey={(row) => row.label}
          searchPlaceholder="Search by name…"
        />
      </section>
      {topRoas.length > 0 ? (
        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={COPY.vibeAds.topRoas.title} subtitle={COPY.vibeAds.topRoas.subtitle} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topRoas.map((row) => (
              <div key={row.label} className="rounded-lg border border-border bg-surfaceElevated px-4 py-3">
                <p className="truncate text-sm font-medium text-textPrimary">{row.label}</p>
                <p className="mt-1 text-lg font-bold text-brand">{formatRoas(row.roas)}</p>
                <p className="text-xs text-textMuted">{formatCurrency(row.spend)} spend</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function CampaignsTab({ rows, dateRange }: { rows: VibeAnalyticsRow[]; dateRange: DateRange }) {
  const c = COPY.vibeAds.campaigns;
  return (
    <AggregatedTab
      rows={rows}
      dateRange={dateRange}
      field="campaignName"
      title={c.table.title}
      subtitle={c.table.subtitle}
      slug="vibe-campaigns"
      resourceType="vibe-ads-campaigns"
    />
  );
}

export function ChannelsTab({ rows, dateRange }: { rows: VibeAnalyticsRow[]; dateRange: DateRange }) {
  const c = COPY.vibeAds.channels;
  return (
    <AggregatedTab
      rows={rows}
      dateRange={dateRange}
      field="channelName"
      title={c.table.title}
      subtitle={c.table.subtitle}
      slug="vibe-channels"
      resourceType="vibe-ads-channels"
    />
  );
}

export function CreativesTab({ rows, dateRange }: { rows: VibeAnalyticsRow[]; dateRange: DateRange }) {
  const c = COPY.vibeAds.creatives;
  return (
    <AggregatedTab
      rows={rows}
      dateRange={dateRange}
      field="creativeName"
      title={c.table.title}
      subtitle={c.table.subtitle}
      slug="vibe-creatives"
      resourceType="vibe-ads-creatives"
    />
  );
}
