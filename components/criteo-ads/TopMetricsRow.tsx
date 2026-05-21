import type { CriteoDailyRow, CriteoOverallRow } from "@/lib/criteo-ads/types";
import { COPY } from "@/lib/copy";
import {
  overallRoas,
  sumAdvertiserCost,
  sumClicks,
  sumDisplays,
  sumRevenue
} from "@/lib/criteo-ads/metrics";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatNumber, formatRoas } from "@/lib/utils/format";
import { DollarSign, Eye, MousePointerClick, ShoppingCart, TrendingUp } from "lucide-react";

export function TopMetricsRow({ daily }: { daily: CriteoDailyRow[] }) {
  const metrics = COPY.criteoAds.metrics;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        label={metrics.totalSpend.label}
        value={formatCurrency(sumAdvertiserCost(daily))}
        icon={DollarSign}
        tooltip={metrics.totalSpend.tooltip}
        description={metrics.totalSpend.description}
        className="border-orange-500/20"
      />
      <MetricCard
        label={metrics.totalClicks.label}
        value={formatNumber(sumClicks(daily))}
        icon={MousePointerClick}
        tooltip={metrics.totalClicks.tooltip}
        description={metrics.totalClicks.description}
      />
      <MetricCard
        label={metrics.totalDisplays.label}
        value={formatNumber(sumDisplays(daily))}
        icon={Eye}
        tooltip={metrics.totalDisplays.tooltip}
        description={metrics.totalDisplays.description}
      />
      <MetricCard
        label={metrics.overallRoas.label}
        value={formatRoas(overallRoas(daily))}
        icon={TrendingUp}
        tooltip={metrics.overallRoas.tooltip}
        description={metrics.overallRoas.description}
        className="border-brand/20"
      />
      <MetricCard
        label={metrics.totalRevenue.label}
        value={formatCurrency(sumRevenue(daily))}
        icon={ShoppingCart}
        tooltip={metrics.totalRevenue.tooltip}
        description={metrics.totalRevenue.description}
      />
    </section>
  );
}

export function OverallSummaryPanel({ overall }: { overall: CriteoOverallRow | null }) {
  const copy = COPY.criteoAds.overview.summary;
  if (!overall) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-textMuted">{copy.empty}</p>
      </section>
    );
  }

  const items = [
    { label: copy.reach, value: formatNumber(overall.reach) },
    { label: copy.frequency, value: formatNumber(overall.frequency) },
    { label: copy.ctr, value: `${overall.clickThroughRate.toFixed(2)}%` },
    { label: copy.cpc, value: formatCurrency(overall.cpc) },
    { label: copy.ecpm, value: formatCurrency(overall.eCpm) },
    { label: copy.sales, value: formatCurrency(overall.salesAllClientAttribution) },
    { label: copy.revenue, value: formatCurrency(overall.revenueGeneratedAllClientAttribution) },
    { label: copy.roas, value: formatRoas(overall.roasAllClientAttribution) }
  ];

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold text-textPrimary">{copy.title}</h2>
      <p className="mt-1 text-sm text-textSecondary">{copy.subtitle}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-surfaceElevated px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-textMuted">{item.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-textPrimary">{item.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-textMuted">
        {copy.totals}: {formatNumber(overall.clicks)} clicks · {formatNumber(overall.displays)} displays ·{" "}
        {formatCurrency(overall.advertiserCost)} spend · {formatCurrency(overall.salesAllClientAttribution)} sales
      </p>
    </section>
  );
}
