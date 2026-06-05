"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { MetaAdInsightRow, MetaCampaignRow } from "@/lib/meta-analytics/types";
import { COPY } from "@/lib/copy";
import {
  aggregateAdsByDay,
  aggregateCampaignsById,
  buildSpendBreakdown,
  campaignColor
} from "@/lib/meta-analytics/metrics";
import { META_CHART_COLORS, metaChartAxisProps } from "@/components/meta-analytics/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency, formatCurrencyCompact, formatDate, formatNumber, formatPercent } from "@/lib/utils/format";

function truncateLabel(label: string, max = 28): string {
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

/** Daily spend trend — uses facebook_ads_insights rows (one per ad per day) for accuracy. */
export function SpendTrendChart({ ads }: { ads: MetaAdInsightRow[] }) {
  const copy = COPY.metaAnalytics.overview.spendTrend;
  const data = aggregateAdsByDay(ads).map((row) => ({
    ...row,
    label: formatDate(row.day)
  }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={META_CHART_COLORS.grid} />
            <XAxis dataKey="label" {...metaChartAxisProps} />
            <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} {...metaChartAxisProps} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div
                    style={{
                      background: META_CHART_COLORS.surface,
                      border: `1px solid ${META_CHART_COLORS.grid}`,
                      borderRadius: 8,
                      padding: 12
                    }}
                    className="text-xs"
                  >
                    <p className="font-medium text-white">{row.label}</p>
                    <p className="text-textSecondary">Spend: {formatCurrency(row.spend)}</p>
                    <p className="text-textSecondary">Clicks: {formatNumber(row.clicks)}</p>
                    <p className="text-textSecondary">Impressions: {formatNumber(row.impressions)}</p>
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="spend" stroke={META_CHART_COLORS.primary} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function TopCampaignsChart({ campaigns }: { campaigns: MetaCampaignRow[] }) {
  const copy = COPY.metaAnalytics.overview.topCampaigns;
  const data = aggregateCampaignsById(campaigns)
    .slice(0, 8)
    .map((row) => ({
      name: truncateLabel(row.label),
      fullName: row.label,
      spend: row.spend,
      ctrPct: row.ctrPct
    }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={META_CHART_COLORS.grid} horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => formatCurrencyCompact(v)} {...metaChartAxisProps} />
            <YAxis type="category" dataKey="name" width={120} {...metaChartAxisProps} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div
                    style={{
                      background: META_CHART_COLORS.surface,
                      border: `1px solid ${META_CHART_COLORS.grid}`,
                      borderRadius: 8,
                      padding: 12
                    }}
                    className="text-xs"
                  >
                    <p className="font-medium text-white">{row.fullName}</p>
                    <p className="text-textSecondary">Spend: {formatCurrency(row.spend)}</p>
                    <p className="text-textSecondary">CTR: {formatPercent(row.ctrPct)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="spend" fill={META_CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function SpendBreakdownPanel({ campaigns }: { campaigns: MetaCampaignRow[] }) {
  const copy = COPY.metaAnalytics.overview.spendBreakdown;
  const rows = buildSpendBreakdown(aggregateCampaignsById(campaigns).slice(0, 6));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <div key={row.name}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-textPrimary" title={row.name}>
                {truncateLabel(row.name, 36)}
              </span>
              <span className="shrink-0 tabular-nums text-textSecondary">
                {formatCurrency(row.value)} · {row.pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surfaceElevated">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(row.pct, 2)}%`, backgroundColor: campaignColor(index) }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OverviewTab({
  campaigns,
  ads
}: {
  campaigns: MetaCampaignRow[];
  ads: MetaAdInsightRow[];
}) {
  if (campaigns.length === 0 && ads.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <SpendTrendChart ads={ads} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopCampaignsChart campaigns={campaigns} />
        <SpendBreakdownPanel campaigns={campaigns} />
      </div>
    </div>
  );
}
