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
import type { CriteoDailyRow, CriteoOverallRow } from "@/lib/criteo-ads/types";
import { COPY } from "@/lib/copy";
import { aggregateByDay, aggregateByField, buildCostBreakdown, campaignColor } from "@/lib/criteo-ads/metrics";
import { CRITEO_CHART_COLORS, criteoChartAxisProps } from "@/components/criteo-ads/chartTheme";
import { OverallSummaryPanel, PeriodSummaryPanel } from "@/components/criteo-ads/TopMetricsRow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency, formatCurrencyCompact, formatDate, formatRoas } from "@/lib/utils/format";

function truncateLabel(label: string, max = 28): string {
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

export function SpendTrendChart({ daily }: { daily: CriteoDailyRow[] }) {
  const copy = COPY.criteoAds.overview.spendTrend;
  const data = aggregateByDay(daily).map((row) => ({
    ...row,
    label: formatDate(row.day)
  }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CRITEO_CHART_COLORS.grid} />
            <XAxis dataKey="label" {...criteoChartAxisProps} />
            <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} {...criteoChartAxisProps} />
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
                    <p className="font-medium text-white">{row.label}</p>
                    <p className="text-textSecondary">Spend: {formatCurrency(row.advertiserCost)}</p>
                    <p className="text-textSecondary">Clicks: {row.clicks.toLocaleString()}</p>
                    <p className="text-textSecondary">ROAS: {formatRoas(row.roas)}</p>
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="advertiserCost" stroke={CRITEO_CHART_COLORS.primary} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function TopCampaignsChart({ daily }: { daily: CriteoDailyRow[] }) {
  const copy = COPY.criteoAds.overview.topCampaigns;
  const data = aggregateByField(daily, "campaignName")
    .slice(0, 8)
    .map((row) => ({
      name: truncateLabel(row.label),
      fullName: row.label,
      cost: row.advertiserCost,
      roas: row.roas
    }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CRITEO_CHART_COLORS.grid} horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => formatCurrencyCompact(v)} {...criteoChartAxisProps} />
            <YAxis type="category" dataKey="name" width={120} {...criteoChartAxisProps} />
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
            <Bar dataKey="cost" fill={CRITEO_CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function CampaignSpendBreakdown({ daily }: { daily: CriteoDailyRow[] }) {
  const copy = COPY.criteoAds.overview.campaignBreakdown;
  const data = buildCostBreakdown(daily, "campaignName").slice(0, 6);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="space-y-3">
        {data.map((row, index) => (
          <div key={row.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-textPrimary">{truncateLabel(row.name, 40)}</span>
              <span className="tabular-nums text-textSecondary">{formatCurrency(row.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surfaceElevated">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max((row.value / (data[0]?.value || 1)) * 100, 4)}%`,
                  backgroundColor: campaignColor(index)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OverviewTab({
  daily,
  overall
}: {
  daily: CriteoDailyRow[];
  overall: CriteoOverallRow | null;
}) {
  return (
    <div className="space-y-6">
      {/* Period-accurate summary — computed from date-filtered daily rows */}
      <PeriodSummaryPanel daily={daily} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpendTrendChart daily={daily} />
        <TopCampaignsChart daily={daily} />
      </div>
      <CampaignSpendBreakdown daily={daily} />
      {/* All-time summary — NOT date-filtered, shown with amber warning */}
      <OverallSummaryPanel overall={overall} />
    </div>
  );
}
