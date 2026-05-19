"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GoogleAdsCreativeRow } from "@/lib/google-ads/types";
import { COPY } from "@/lib/copy";
import { aggregateByField, buildCostBreakdown } from "@/lib/google-ads/metrics";
import { ADS_CHART_COLORS, adsChartAxisProps } from "@/components/google-ads/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

const TYPE_COLORS = [ADS_CHART_COLORS.googleBlue, ADS_CHART_COLORS.primary, ADS_CHART_COLORS.purple, ADS_CHART_COLORS.cyan, ADS_CHART_COLORS.brand, ADS_CHART_COLORS.gray];

function truncateLabel(label: string, max = 36): string {
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

export function CreativesTab({ creatives }: { creatives: GoogleAdsCreativeRow[] }) {
  const typeCopy = COPY.googleAds.creatives.adType;
  const topCopy = COPY.googleAds.creatives.topPerformers;
  const tableCopy = COPY.googleAds.creatives.performanceTable;

  const typeData = buildCostBreakdown(creatives, "adType");
  const chartData = aggregateByField(creatives, "adName")
    .slice(0, 8)
    .map((row) => ({ name: truncateLabel(row.label), fullName: row.label, clicks: row.clicks, roas: row.roas }));

  const sorted = [...creatives].sort((a, b) => b.clicks - a.clicks);

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
        <SectionTitle title={tableCopy.title} subtitle={tableCopy.subtitle} />
        {sorted.length === 0 ? (
          <p className="text-sm text-textMuted">{COPY.googleAds.empty.creatives}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
                  <th className="py-2 pr-3">Ad</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Campaign</th>
                  <th className="py-2 pr-3">Clicks</th>
                  <th className="py-2 pr-3">Spend</th>
                  <th className="py-2 pr-3">Conv.</th>
                  <th className="py-2">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="max-w-[180px] truncate py-3 pr-3 font-medium text-textPrimary" title={row.adName}>
                      {row.adName}
                    </td>
                    <td className="py-3 pr-3">
                      <StatusBadge variant="muted">{row.adType.replace(/_/g, " ")}</StatusBadge>
                    </td>
                    <td className="max-w-[140px] truncate py-3 pr-3 text-textSecondary" title={row.campaignName}>
                      {row.campaignName}
                    </td>
                    <td className="py-3 pr-3 tabular-nums">{formatNumber(row.clicks)}</td>
                    <td className="py-3 pr-3 tabular-nums">{formatCurrency(row.cost)}</td>
                    <td className="py-3 pr-3 tabular-nums">{formatNumber(row.conversions)}</td>
                    <td className="py-3 tabular-nums font-medium text-brand">{formatRoas(row.roas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
