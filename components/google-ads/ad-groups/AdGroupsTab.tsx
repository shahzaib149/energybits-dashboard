"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GoogleAdsAdGroupRow } from "@/lib/google-ads/types";
import { COPY } from "@/lib/copy";
import { aggregateByField } from "@/lib/google-ads/metrics";
import { ADS_CHART_COLORS, adsChartAxisProps } from "@/components/google-ads/chartTheme";
import type { DateRange } from "@/lib/date-range/types";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { adGroupColumns, adsFilename } from "@/lib/csv/columns";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatCurrencyCompact, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

function truncateLabel(label: string, max = 28): string {
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

export function AdGroupsTab({
  adGroups,
  dateRange
}: {
  adGroups: GoogleAdsAdGroupRow[];
  dateRange: DateRange;
}) {
  const chartCopy = COPY.googleAds.adGroups.topSpend;
  const tableCopy = COPY.googleAds.adGroups.performanceTable;

  const chartData = aggregateByField(adGroups, "adGroupName")
    .slice(0, 10)
    .map((row) => ({
      name: truncateLabel(row.label),
      fullName: row.label,
      cost: row.cost,
      roas: row.roas
    }));

  const sorted = [...adGroups].sort((a, b) => b.cost - a.cost);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionTitle title={chartCopy.title} subtitle={chartCopy.subtitle} />
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ADS_CHART_COLORS.grid} horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => formatCurrencyCompact(v)} {...adsChartAxisProps} />
              <YAxis type="category" dataKey="name" width={130} {...adsChartAxisProps} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const row = payload[0].payload as (typeof chartData)[number];
                  return (
                    <div style={{ background: ADS_CHART_COLORS.surface, border: `1px solid ${ADS_CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                      <p className="font-medium text-white">{row.fullName}</p>
                      <p className="text-textSecondary">Spend: {formatCurrency(row.cost)}</p>
                      <p className="text-textSecondary">ROAS: {formatRoas(row.roas)}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="cost" fill={ADS_CHART_COLORS.googleBlue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionHeaderRow
          title={tableCopy.title}
          subtitle={tableCopy.subtitle}
          actions={
            <CSVExportButton
              data={sorted}
              columns={adGroupColumns}
              filename={adsFilename("ad-groups", dateRange)}
              resourceType="google-ads-ad-groups"
            />
          }
        />
        {sorted.length === 0 ? (
          <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
        ) : (
          <PaginatedTable
            rows={sorted}
            columns={[
              {
                id: "adGroup",
                header: "Ad Group",
                searchValue: (row) => row.adGroupName,
                render: (row) => (
                  <span className="block max-w-[160px] truncate font-medium text-textPrimary" title={row.adGroupName}>
                    {row.adGroupName}
                  </span>
                )
              },
              {
                id: "campaign",
                header: "Campaign",
                searchValue: (row) => row.campaignName,
                render: (row) => (
                  <span className="block max-w-[160px] truncate text-textSecondary" title={row.campaignName}>
                    {row.campaignName}
                  </span>
                )
              },
              {
                id: "status",
                header: "Status",
                searchValue: (row) => row.adGroupStatus,
                render: (row) => (
                  <StatusBadge variant={row.adGroupStatus === "ENABLED" ? "brand" : "muted"}>{row.adGroupStatus}</StatusBadge>
                )
              },
              {
                id: "spend",
                header: "Spend",
                className: "tabular-nums",
                render: (row) => formatCurrency(row.cost)
              },
              {
                id: "clicks",
                header: "Clicks",
                className: "tabular-nums",
                render: (row) => formatNumber(row.clicks)
              },
              {
                id: "ctr",
                header: "CTR",
                className: "tabular-nums",
                render: (row) => formatPercent(row.ctrPct)
              },
              {
                id: "roas",
                header: "ROAS",
                className: "tabular-nums font-medium text-brand",
                render: (row) => formatRoas(row.roas)
              }
            ]}
            getRowKey={(row) => row.id}
            searchPlaceholder="Search ad groups or campaigns…"
          />
        )}
      </section>
    </div>
  );
}
