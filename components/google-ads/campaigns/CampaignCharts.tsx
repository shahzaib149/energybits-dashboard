"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GoogleAdsCampaignRow } from "@/lib/google-ads/types";
import { COPY } from "@/lib/copy";
import { aggregateByField, channelTypeColor } from "@/lib/google-ads/metrics";
import { ADS_CHART_COLORS, adsChartAxisProps } from "@/components/google-ads/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency, formatCurrencyCompact, formatRoas } from "@/lib/utils/format";

function truncateLabel(label: string, max = 32): string {
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

export function TopCampaignsSpendChart({ campaigns }: { campaigns: GoogleAdsCampaignRow[] }) {
  const copy = COPY.googleAds.campaigns.topSpend;
  const data = aggregateByField(campaigns, "campaignName")
    .slice(0, 10)
    .map((row) => ({
      name: truncateLabel(row.label),
      fullName: row.label,
      cost: row.cost,
      roas: row.roas,
      clicks: row.clicks
    }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ADS_CHART_COLORS.grid} horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => formatCurrencyCompact(v)} {...adsChartAxisProps} />
            <YAxis type="category" dataKey="name" width={140} {...adsChartAxisProps} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div style={{ background: ADS_CHART_COLORS.surface, border: `1px solid ${ADS_CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                    <p className="font-medium text-white">{row.fullName}</p>
                    <p className="text-textSecondary">Spend: {formatCurrency(row.cost)}</p>
                    <p className="text-textSecondary">ROAS: {formatRoas(row.roas)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="cost" fill={ADS_CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function ChannelTypeBreakdown({ campaigns }: { campaigns: GoogleAdsCampaignRow[] }) {
  const copy = COPY.googleAds.campaigns.channelType;
  const data = aggregateByField(campaigns, "channelType");

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="space-y-3">
        {data.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-textPrimary">{row.label.replace(/_/g, " ")}</span>
              <span className="tabular-nums text-textSecondary">{formatCurrency(row.cost)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surfaceElevated">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(row.cost / (data[0]?.cost || 1) * 100, 4)}%`,
                  backgroundColor: channelTypeColor(row.label)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
