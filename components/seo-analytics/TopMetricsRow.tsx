import type { GA4PageRow, SEOTrackingRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import {
  averageCTR,
  sumClicks,
  sumImpressions,
  weightedAveragePosition
} from "@/lib/seo-analytics/metrics";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatNumber, formatPercent, formatPosition } from "@/lib/utils/format";
import { Eye, MousePointerClick, Search, TrendingUp } from "lucide-react";

export interface TopMetricsRowProps {
  keywords: SEOTrackingRow[];
  pages: GA4PageRow[];
}

export function TopMetricsRow({ keywords }: TopMetricsRowProps) {
  const metrics = COPY.seoAnalytics.metrics;
  const clicks = sumClicks(keywords);
  const impressions = sumImpressions(keywords);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label={metrics.totalClicks.label}
        value={formatNumber(clicks)}
        icon={MousePointerClick}
        tooltip={metrics.totalClicks.tooltip}
        description={metrics.totalClicks.description}
      />
      <MetricCard
        label={metrics.totalImpressions.label}
        value={formatNumber(impressions)}
        icon={Eye}
        tooltip={metrics.totalImpressions.tooltip}
        description={metrics.totalImpressions.description}
      />
      <MetricCard
        label={metrics.avgCTR.label}
        value={formatPercent(averageCTR(keywords))}
        icon={TrendingUp}
        tooltip={metrics.avgCTR.tooltip}
        description={metrics.avgCTR.description}
      />
      <MetricCard
        label={metrics.avgPosition.label}
        value={formatPosition(weightedAveragePosition(keywords))}
        icon={Search}
        tooltip={metrics.avgPosition.tooltip}
        description={metrics.avgPosition.description}
      />
    </section>
  );
}
