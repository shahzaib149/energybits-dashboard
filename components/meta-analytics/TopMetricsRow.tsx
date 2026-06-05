import type { MetaAdInsightRow } from "@/lib/meta-analytics/types";
import { COPY } from "@/lib/copy";
import {
  sumClicks,
  sumImpressions,
  sumReach,
  sumSpend
} from "@/lib/meta-analytics/metrics";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { DollarSign, Eye, MousePointerClick, Percent, Target, Users } from "lucide-react";

function computeCtrPct(clicks: number, impressions: number): number {
  return impressions > 0 ? (clicks / impressions) * 100 : 0;
}
function computeCpc(spend: number, clicks: number): number {
  return clicks > 0 ? spend / clicks : 0;
}
function computeCpm(spend: number, impressions: number): number {
  return impressions > 0 ? (spend / impressions) * 1000 : 0;
}

/** Uses daily ad-insight rows so totals reflect the selected date range, not campaign lifetimes. */
export function TopMetricsRow({ ads }: { ads: MetaAdInsightRow[] }) {
  const m = COPY.metaAnalytics.metrics;

  const spend = sumSpend(ads);
  const impressions = sumImpressions(ads);
  const clicks = sumClicks(ads);
  const reach = sumReach(ads);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <MetricCard
        label={m.totalSpend.label}
        value={formatCurrency(spend)}
        icon={DollarSign}
        tooltip={m.totalSpend.tooltip}
        description={m.totalSpend.description}
        className="border-[#0081FB]/20"
      />
      <MetricCard
        label={m.impressions.label}
        value={formatNumber(impressions)}
        icon={Eye}
        tooltip={m.impressions.tooltip}
        description={m.impressions.description}
      />
      <MetricCard
        label={m.clicks.label}
        value={formatNumber(clicks)}
        icon={MousePointerClick}
        tooltip={m.clicks.tooltip}
        description={m.clicks.description}
      />
      <MetricCard
        label={m.reach.label}
        value={formatNumber(reach)}
        icon={Users}
        tooltip={m.reach.tooltip}
        description={m.reach.description}
      />
      <MetricCard
        label={m.ctr.label}
        value={formatPercent(computeCtrPct(clicks, impressions))}
        icon={Percent}
        tooltip={m.ctr.tooltip}
        description={m.ctr.description}
      />
      <MetricCard
        label={m.cpc.label}
        value={formatCurrency(computeCpc(spend, clicks))}
        icon={Target}
        tooltip={m.cpc.tooltip}
        description={`CPM ${formatCurrency(computeCpm(spend, impressions))}`}
      />
    </section>
  );
}
