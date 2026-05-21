import type { VibeAnalyticsRow } from "@/lib/vibe-ads/types";
import { COPY } from "@/lib/copy";
import { avgRoas, sumCompletedViews, sumHouseholds, sumImpressions, sumSpend } from "@/lib/vibe-ads/metrics";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatNumber, formatRoas } from "@/lib/utils/format";
import { DollarSign, Eye, Home, TrendingUp, Tv } from "lucide-react";

export function TopMetricsRow({ rows }: { rows: VibeAnalyticsRow[] }) {
  const m = COPY.vibeAds.metrics;
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard label={m.spend.label} value={formatCurrency(sumSpend(rows))} icon={DollarSign} tooltip={m.spend.tooltip} description={m.spend.description} className="border-violet-500/20" />
      <MetricCard label={m.impressions.label} value={formatNumber(sumImpressions(rows))} icon={Eye} tooltip={m.impressions.tooltip} description={m.impressions.description} />
      <MetricCard label={m.completedViews.label} value={formatNumber(sumCompletedViews(rows))} icon={Tv} tooltip={m.completedViews.tooltip} description={m.completedViews.description} />
      <MetricCard label={m.households.label} value={formatNumber(sumHouseholds(rows))} icon={Home} tooltip={m.households.tooltip} description={m.households.description} />
      <MetricCard label={m.roas.label} value={formatRoas(avgRoas(rows))} icon={TrendingUp} tooltip={m.roas.tooltip} description={m.roas.description} className="border-brand/20" />
    </section>
  );
}
