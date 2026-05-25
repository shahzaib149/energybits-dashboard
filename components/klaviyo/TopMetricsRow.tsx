import type { KlaviyoAnalyticsRow } from "@/lib/klaviyo/types";
import { COPY } from "@/lib/copy";
import { sumCounts, sumOrderValue, sumUniqueCounts, uniqueMetricCount } from "@/lib/klaviyo/metrics";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { DollarSign, Layers, MousePointerClick, Users } from "lucide-react";

export function TopMetricsRow({ rows }: { rows: KlaviyoAnalyticsRow[] }) {
  const m = COPY.klaviyo.metrics;
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label={m.totalEvents.label}
        value={formatNumber(sumCounts(rows))}
        icon={MousePointerClick}
        tooltip={m.totalEvents.tooltip}
        description={m.totalEvents.description}
        className="border-emerald-500/20"
      />
      <MetricCard
        label={m.uniqueContacts.label}
        value={formatNumber(sumUniqueCounts(rows))}
        icon={Users}
        tooltip={m.uniqueContacts.tooltip}
        description={m.uniqueContacts.description}
      />
      <MetricCard
        label={m.orderRevenue.label}
        value={formatCurrency(sumOrderValue(rows))}
        icon={DollarSign}
        tooltip={m.orderRevenue.tooltip}
        description={m.orderRevenue.description}
        className="border-brand/20"
      />
      <MetricCard
        label={m.metricTypes.label}
        value={formatNumber(uniqueMetricCount(rows))}
        icon={Layers}
        tooltip={m.metricTypes.tooltip}
        description={m.metricTypes.description}
      />
    </section>
  );
}
