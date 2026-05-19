"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GoogleAdsKeywordRow } from "@/lib/google-ads/types";
import { COPY } from "@/lib/copy";
import { aggregateByField, buildCostBreakdown, matchTypeColor, topByRoas } from "@/lib/google-ads/metrics";
import { ADS_CHART_COLORS, adsChartAxisProps } from "@/components/google-ads/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency, formatCurrencyCompact, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

function truncateLabel(label: string, max = 24): string {
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

export function KeywordsTab({ keywords }: { keywords: GoogleAdsKeywordRow[] }) {
  const matchCopy = COPY.googleAds.keywords.matchType;
  const topCopy = COPY.googleAds.keywords.topKeywords;
  const roasCopy = COPY.googleAds.keywords.topRoas;
  const tableCopy = COPY.googleAds.keywords.performanceTable;

  const matchData = buildCostBreakdown(keywords, "matchType");
  const spendChart = aggregateByField(keywords, "keywordText")
    .slice(0, 10)
    .map((row) => ({ name: truncateLabel(row.label), fullName: row.label, cost: row.cost, roas: row.roas }));
  const topRoasRows = topByRoas(keywords, 5, 8);
  const sorted = [...keywords].sort((a, b) => b.cost - a.cost);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={matchCopy.title} subtitle={matchCopy.subtitle} />
          <div className="relative h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={matchData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {matchData.map((entry) => (
                    <Cell key={entry.name} fill={matchTypeColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const row = payload[0].payload as (typeof matchData)[number];
                    return (
                      <div style={{ background: ADS_CHART_COLORS.surface, border: `1px solid ${ADS_CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                        <p className="font-medium text-white">{row.name}</p>
                        <p className="text-textSecondary">{formatCurrency(row.value)}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {matchData.map((row) => (
              <span
                key={row.name}
                className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs"
                style={{ borderColor: `${matchTypeColor(row.name)}40`, color: matchTypeColor(row.name) }}
              >
                {row.name}: {formatCurrency(row.value)}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 lg:col-span-2">
          <SectionTitle title={topCopy.title} subtitle={topCopy.subtitle} />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendChart} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ADS_CHART_COLORS.grid} horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatCurrencyCompact(v)} {...adsChartAxisProps} />
                <YAxis type="category" dataKey="name" width={100} {...adsChartAxisProps} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const row = payload[0].payload as (typeof spendChart)[number];
                    return (
                      <div style={{ background: ADS_CHART_COLORS.surface, border: `1px solid ${ADS_CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                        <p className="font-medium text-white">{row.fullName}</p>
                        <p className="text-textSecondary">Spend: {formatCurrency(row.cost)} · ROAS: {formatRoas(row.roas)}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="cost" fill={ADS_CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionTitle title={roasCopy.title} subtitle={roasCopy.subtitle} />
        {topRoasRows.length === 0 ? (
          <p className="text-sm text-textMuted">Not enough keyword spend to rank by ROAS yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topRoasRows.map((row) => (
              <div key={row.id} className="rounded-lg border border-border bg-surfaceElevated p-4">
                <p className="truncate font-medium text-textPrimary" title={row.keywordText}>{row.keywordText}</p>
                <p className="mt-1 text-xs text-textMuted">{row.matchType} · {row.campaignName}</p>
                <p className="mt-2 text-xl font-bold tabular-nums text-brand">{formatRoas(row.roas)}</p>
                <p className="text-xs text-textSecondary">{formatCurrency(row.cost)} · {formatNumber(row.conversions)} conv.</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionTitle title={tableCopy.title} subtitle={tableCopy.subtitle} />
        {sorted.length === 0 ? (
          <p className="text-sm text-textMuted">{COPY.googleAds.empty.keywords}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
                  <th className="py-2 pr-3">Keyword</th>
                  <th className="py-2 pr-3">Match</th>
                  <th className="py-2 pr-3">Campaign</th>
                  <th className="py-2 pr-3">Spend</th>
                  <th className="py-2 pr-3">Clicks</th>
                  <th className="py-2 pr-3">CTR</th>
                  <th className="py-2">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="max-w-[160px] truncate py-3 pr-3 font-medium text-textPrimary" title={row.keywordText}>
                      {row.keywordText}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className="inline-flex rounded-md border px-2 py-0.5 text-xs font-medium"
                        style={{ borderColor: `${matchTypeColor(row.matchType)}40`, color: matchTypeColor(row.matchType) }}
                      >
                        {row.matchType}
                      </span>
                    </td>
                    <td className="max-w-[140px] truncate py-3 pr-3 text-textSecondary" title={row.campaignName}>
                      {row.campaignName}
                    </td>
                    <td className="py-3 pr-3 tabular-nums">{formatCurrency(row.cost)}</td>
                    <td className="py-3 pr-3 tabular-nums">{formatNumber(row.clicks)}</td>
                    <td className="py-3 pr-3 tabular-nums">{formatPercent(row.ctrPct)}</td>
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
