import type { CriteoDailyRow, CriteoOverallRow } from "@/lib/criteo-ads/types";
import { COPY } from "@/lib/copy";
import {
  overallRoas,
  sumAdvertiserCost,
  sumClicks,
  sumDisplays,
  sumRevenue,
  sumSales
} from "@/lib/criteo-ads/metrics";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";
import { DollarSign, Eye, MousePointerClick, ShoppingCart, TrendingUp } from "lucide-react";

function computeCtrPct(clicks: number, displays: number): number {
  return displays > 0 ? (clicks / displays) * 100 : 0;
}
function computeCpc(cost: number, clicks: number): number {
  return clicks > 0 ? cost / clicks : 0;
}
function computeECpm(cost: number, displays: number): number {
  return displays > 0 ? (cost / displays) * 1000 : 0;
}

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

/**
 * Period-accurate summary derived from date-filtered daily rows.
 * CTR, CPC, eCPM, ROAS are all recomputed from aggregated totals — never averaged.
 */
export function PeriodSummaryPanel({ daily }: { daily: CriteoDailyRow[] }) {
  if (daily.length === 0) return null;

  const totalCost = sumAdvertiserCost(daily);
  const totalClicks = sumClicks(daily);
  const totalDisplays = sumDisplays(daily);
  const totalRevenue = sumRevenue(daily);
  const totalSales = sumSales(daily);

  const items = [
    { label: "Spend", value: formatCurrency(totalCost) },
    { label: "Clicks", value: formatNumber(totalClicks) },
    { label: "Displays", value: formatNumber(totalDisplays) },
    { label: "CTR", value: formatPercent(computeCtrPct(totalClicks, totalDisplays)) },
    { label: "CPC", value: formatCurrency(computeCpc(totalCost, totalClicks)) },
    { label: "eCPM", value: formatCurrency(computeECpm(totalCost, totalDisplays)) },
    { label: "Sales", value: formatCurrency(totalSales) },
    { label: "Revenue", value: formatCurrency(totalRevenue) },
    { label: "ROAS", value: formatRoas(overallRoas(daily)) }
  ];

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-textPrimary">Period Summary</h2>
          <p className="mt-0.5 text-sm text-textSecondary">
            Totals for the selected date range — all metrics calculated from raw daily rows
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-400">
          Date-filtered
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-9">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-surfaceElevated px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-textMuted">{item.label}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-textPrimary">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * All-time account totals from Criteo's summary table.
 * NOT filtered by date — shown separately with a clear label.
 */
export function OverallSummaryPanel({ overall }: { overall: CriteoOverallRow | null }) {
  const copy = COPY.criteoAds.overview.summary;
  if (!overall) return null;

  const items = [
    { label: copy.reach, value: formatNumber(overall.reach) },
    { label: copy.frequency, value: overall.frequency.toFixed(2) },
    { label: copy.ctr, value: `${overall.clickThroughRate.toFixed(2)}%` },
    { label: copy.cpc, value: formatCurrency(overall.cpc) },
    { label: copy.ecpm, value: formatCurrency(overall.eCpm) },
    { label: copy.sales, value: formatCurrency(overall.salesAllClientAttribution) },
    { label: copy.revenue, value: formatCurrency(overall.revenueGeneratedAllClientAttribution) },
    { label: copy.roas, value: formatRoas(overall.roasAllClientAttribution) }
  ];

  return (
    <section className="rounded-xl border border-amber-500/20 bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-textPrimary">{copy.title}</h2>
          <p className="mt-0.5 text-sm text-textSecondary">{copy.subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
          All-time · not date-filtered
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-surfaceElevated px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-textMuted">{item.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-textPrimary">{item.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-amber-400/80">
        ⚠ These are all-time account totals from Criteo — not filtered by the selected date range.
        Use the Period Summary above for date-range-specific numbers.
      </p>
    </section>
  );
}
