import type { MetaCampaignRow } from "@/lib/meta-analytics/types";
import { COPY } from "@/lib/copy";
import {
  sumClicks,
  sumImpressions,
  sumReach,
  sumSpend,
  weightedCpc,
  weightedCpm,
  weightedCtrPct
} from "@/lib/meta-analytics/metrics";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { DollarSign, Eye, MousePointerClick, Percent, Target, Users } from "lucide-react";

/**
 * Uses deduplicated campaign rows (one record per campaign per day).
 * Spend, clicks, and impressions are summed across all matching daily records —
 * these numbers match the selected date range because each row is a single day's snapshot.
 */
export function TopMetricsRow({ campaigns }: { campaigns: MetaCampaignRow[] }) {
  const m = COPY.metaAnalytics.metrics;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <MetricCard
        label={m.totalSpend.label}
        value={formatCurrency(sumSpend(campaigns))}
        icon={DollarSign}
        tooltip={m.totalSpend.tooltip}
        description={m.totalSpend.description}
        className="border-[#0081FB]/20"
      />
      <MetricCard
        label={m.impressions.label}
        value={formatNumber(sumImpressions(campaigns))}
        icon={Eye}
        tooltip={m.impressions.tooltip}
        description={m.impressions.description}
      />
      <MetricCard
        label={m.clicks.label}
        value={formatNumber(sumClicks(campaigns))}
        icon={MousePointerClick}
        tooltip={m.clicks.tooltip}
        description={m.clicks.description}
      />
      <MetricCard
        label={m.reach.label}
        value={formatNumber(sumReach(campaigns))}
        icon={Users}
        tooltip={m.reach.tooltip}
        description={m.reach.description}
      />
      <MetricCard
        label={m.ctr.label}
        value={formatPercent(weightedCtrPct(campaigns))}
        icon={Percent}
        tooltip={m.ctr.tooltip}
        description={m.ctr.description}
      />
      <MetricCard
        label={m.cpc.label}
        value={formatCurrency(weightedCpc(campaigns))}
        icon={Target}
        tooltip={m.cpc.tooltip}
        description={`CPM ${formatCurrency(weightedCpm(campaigns))}`}
      />
    </section>
  );
}
