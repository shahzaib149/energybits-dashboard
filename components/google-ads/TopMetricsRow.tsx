import type { GoogleAdsCampaignRow } from "@/lib/google-ads/types";
import { COPY } from "@/lib/copy";
import {
  overallRoas,
  sumClicks,
  sumConversions,
  sumCost
} from "@/lib/google-ads/metrics";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatNumber, formatRoas } from "@/lib/utils/format";
import { DollarSign, MousePointerClick, ShoppingCart, TrendingUp } from "lucide-react";

export function TopMetricsRow({ campaigns }: { campaigns: GoogleAdsCampaignRow[] }) {
  const metrics = COPY.googleAds.metrics;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label={metrics.totalSpend.label}
        value={formatCurrency(sumCost(campaigns))}
        icon={DollarSign}
        tooltip={metrics.totalSpend.tooltip}
        description={metrics.totalSpend.description}
        className="border-amber-500/20"
      />
      <MetricCard
        label={metrics.totalClicks.label}
        value={formatNumber(sumClicks(campaigns))}
        icon={MousePointerClick}
        tooltip={metrics.totalClicks.tooltip}
        description={metrics.totalClicks.description}
      />
      <MetricCard
        label={metrics.overallRoas.label}
        value={formatRoas(overallRoas(campaigns))}
        icon={TrendingUp}
        tooltip={metrics.overallRoas.tooltip}
        description={metrics.overallRoas.description}
        className="border-brand/20"
      />
      <MetricCard
        label={metrics.totalConversions.label}
        value={formatNumber(sumConversions(campaigns))}
        icon={ShoppingCart}
        tooltip={metrics.totalConversions.tooltip}
        description={metrics.totalConversions.description}
      />
    </section>
  );
}
