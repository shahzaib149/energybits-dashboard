"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GoogleAdsCampaignRow, GoogleAdsCreativeRow } from "@/lib/google-ads/types";
import { COPY } from "@/lib/copy";
import { aggregateByField, buildCostBreakdown } from "@/lib/google-ads/metrics";
import { ADS_CHART_COLORS, adsChartAxisProps } from "@/components/google-ads/chartTheme";
import type { DateRange } from "@/lib/date-range/types";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { adsFilename, creativeColumns } from "@/lib/csv/columns";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

const TYPE_COLORS = [ADS_CHART_COLORS.googleBlue, ADS_CHART_COLORS.primary, ADS_CHART_COLORS.purple, ADS_CHART_COLORS.cyan, ADS_CHART_COLORS.brand, ADS_CHART_COLORS.gray];

function truncateLabel(label: string, max = 36): string {
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreativesTab({
  creatives,
  campaigns,
  dateRange
}: {
  creatives: GoogleAdsCreativeRow[];
  campaigns: GoogleAdsCampaignRow[];
  dateRange: DateRange;
}) {
  const typeCopy = COPY.googleAds.creatives.adType;
  const topCopy = COPY.googleAds.creatives.topPerformers;
  const tableCopy = COPY.googleAds.creatives.performanceTable;

  const typeData = buildCostBreakdown(creatives, "adType");
  const chartData = aggregateByField(creatives, "adName")
    .slice(0, 8)
    .map((row) => ({ name: truncateLabel(row.label), fullName: row.label, clicks: row.clicks, roas: row.roas }));

  // Aggregate all daily rows → one row per unique ad name
  const adMap = new Map<string, {
    adName: string; adType: string; campaignName: string;
    clicks: number; cost: number; impressions: number;
    conversions: number; conversionValue: number;
  }>();
  for (const row of creatives) {
    const key = row.adName || row.adId || row.id;
    const existing = adMap.get(key);
    if (!existing) {
      adMap.set(key, {
        adName: row.adName, adType: row.adType, campaignName: row.campaignName,
        clicks: row.clicks, cost: row.cost, impressions: row.impressions,
        conversions: row.conversions, conversionValue: row.conversionValue
      });
    } else {
      existing.clicks += row.clicks;
      existing.cost += row.cost;
      existing.impressions += row.impressions;
      existing.conversions += row.conversions;
      existing.conversionValue += row.conversionValue;
    }
  }
  const aggregatedCreatives = Array.from(adMap.values())
    .map(r => ({
      ...r,
      roas: r.cost > 0 ? r.conversionValue / r.cost : 0,
      ctrPct: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={typeCopy.title} subtitle={typeCopy.subtitle} />
          <div className="relative h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={2}>
                  {typeData.map((entry, index) => (
                    <Cell key={entry.name} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const row = payload[0].payload as (typeof typeData)[number];
                    return (
                      <div style={{ background: ADS_CHART_COLORS.surface, border: `1px solid ${ADS_CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                        <p className="font-medium text-white">{row.name.replace(/_/g, " ")}</p>
                        <p className="text-textSecondary">{formatCurrency(row.value)} ({row.pct.toFixed(1)}%)</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={topCopy.title} subtitle={topCopy.subtitle} />
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ADS_CHART_COLORS.grid} />
                <XAxis dataKey="name" angle={-25} textAnchor="end" height={70} {...adsChartAxisProps} />
                <YAxis {...adsChartAxisProps} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const row = payload[0].payload as (typeof chartData)[number];
                    return (
                      <div style={{ background: ADS_CHART_COLORS.surface, border: `1px solid ${ADS_CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                        <p className="font-medium text-white">{row.fullName}</p>
                        <p className="text-textSecondary">{formatNumber(row.clicks)} clicks · {formatRoas(row.roas)} ROAS</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="clicks" fill={ADS_CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionHeaderRow
          title={tableCopy.title}
          subtitle={tableCopy.subtitle}
          actions={
            <CSVExportButton
              data={creatives}
              columns={creativeColumns}
              filename={adsFilename("creatives", dateRange)}
              resourceType="google-ads-creatives"
            />
          }
        />
        {aggregatedCreatives.length === 0 ? (
          <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
        ) : (
          <PaginatedTable
            rows={aggregatedCreatives}
            columns={[
              {
                id: "ad",
                header: "Ad",
                searchValue: (row) => row.adName,
                render: (row) => (
                  <Link
                    href={`/google-ads-analytics/creative-detail?name=${encodeURIComponent(row.adName)}`}
                    className="block max-w-[180px] truncate font-medium text-brand hover:underline"
                    title={row.adName}
                  >
                    {row.adName}
                  </Link>
                )
              },
              {
                id: "type",
                header: "Type",
                searchValue: (row) => row.adType,
                render: (row) => <StatusBadge variant="muted">{row.adType.replace(/_/g, " ")}</StatusBadge>
              },
              {
                id: "campaign",
                header: "Campaign",
                searchValue: (row) => row.campaignName,
                render: (row) => (
                  <span className="block max-w-[140px] truncate text-textSecondary" title={row.campaignName}>
                    {row.campaignName}
                  </span>
                )
              },
              {
                id: "clicks",
                header: "Clicks",
                className: "tabular-nums",
                render: (row) => formatNumber(row.clicks)
              },
              {
                id: "spend",
                header: "Spend",
                className: "tabular-nums",
                render: (row) => formatCurrency(row.cost)
              },
              {
                id: "conv",
                header: "Conv.",
                className: "tabular-nums",
                render: (row) => formatNumber(row.conversions)
              },
              {
                id: "roas",
                header: "ROAS",
                className: "tabular-nums font-medium text-brand",
                render: (row) => formatRoas(row.roas)
              }
            ]}
            getRowKey={(row) => row.adName}
            searchPlaceholder="Search ads or campaigns…"
          />
        )}
      </section>
    </div>
  );
}
