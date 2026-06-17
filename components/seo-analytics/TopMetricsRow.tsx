import type { GA4PageRow, SEOTrackingRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import {
  averageCTR,
  sumClicks,
  sumImpressions,
  weightedAveragePosition
} from "@/lib/seo-analytics/metrics";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatDuration, formatNumber, formatPercent, formatPosition } from "@/lib/utils/format";
import { Activity, Clock, Eye, MousePointerClick, Search, TrendingDown, TrendingUp, Users } from "lucide-react";

export interface TopMetricsRowProps {
  keywords: SEOTrackingRow[];
  pages: GA4PageRow[];
}

export function TopMetricsRow({ keywords, pages }: TopMetricsRowProps) {
  const metrics = COPY.seoAnalytics.metrics;
  const clicks = sumClicks(keywords);
  const impressions = sumImpressions(keywords);

  // GA4 aggregates
  const totalSessions = pages.reduce((s, p) => s + p.sessions, 0);
  const totalSessions1 = totalSessions || 1;
  const avgEngagement = pages.reduce((s, p) => s + p.engagementRatePct * p.sessions, 0) / totalSessions1;
  const avgBounce = pages.reduce((s, p) => s + p.bounceRatePct * p.sessions, 0) / totalSessions1;
  const avgDuration = pages.reduce((s, p) => s + p.averageSessionDuration * p.sessions, 0) / totalSessions1;

  return (
    <div className="space-y-4">
      {/* GSC / keyword row */}
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

      {/* GA4 page performance row */}
      {pages.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Sessions"
            value={formatNumber(totalSessions)}
            icon={Users}
            description="GA4 sessions across all tracked pages"
          />
          <MetricCard
            label="Avg Engagement Rate"
            value={formatPercent(avgEngagement)}
            icon={Activity}
            description="% of sessions with meaningful interaction"
          />
          <MetricCard
            label="Avg Bounce Rate"
            value={formatPercent(avgBounce)}
            icon={TrendingDown}
            description="% of sessions that left without interaction"
          />
          <MetricCard
            label="Avg Session Duration"
            value={formatDuration(avgDuration)}
            icon={Clock}
            description="Average time users spend per session"
          />
        </section>
      ) : null}
    </div>
  );
}
