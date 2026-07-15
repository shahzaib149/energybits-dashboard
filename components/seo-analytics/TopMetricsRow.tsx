import type { GA4PageRow, SEOTrackingRow } from "@/lib/airtable/types";
import type { SEOTrendPoint, GA4TrendPoint } from "@/lib/seo-analytics/trends";
import { COPY } from "@/lib/copy";
import {
  averageCTR,
  sumClicks,
  sumImpressions,
  weightedAveragePosition
} from "@/lib/seo-analytics/metrics";
import { computeMetricDelta, formatDelta } from "@/lib/seo-analytics/comparison";
import { MetricCard, type MetricDeltaDisplay } from "@/components/ui/MetricCard";
import { formatDuration, formatNumber, formatPercent, formatPosition } from "@/lib/utils/format";
import { Activity, Clock, Eye, MousePointerClick, Search, TrendingDown, TrendingUp, Users } from "lucide-react";

export interface TopMetricsRowProps {
  keywords: SEOTrackingRow[];
  pages: GA4PageRow[];
  seoTrend?: SEOTrendPoint[];
  ga4Trend?: GA4TrendPoint[];
}

function makeDelta(
  current: number,
  previous: number,
  positive?: boolean
): MetricDeltaDisplay | undefined {
  const delta = computeMetricDelta(current, previous);
  return {
    value: formatDelta(delta),
    direction: delta.direction,
    positive: positive ?? (delta.direction === "up")
  };
}

export function TopMetricsRow({ keywords, pages, seoTrend, ga4Trend }: TopMetricsRowProps) {
  const metrics = COPY.seoAnalytics.metrics;
  const clicks = sumClicks(keywords);
  const impressions = sumImpressions(keywords);

  // GA4 aggregates
  const totalSessions = pages.reduce((s, p) => s + p.sessions, 0);
  const totalSessions1 = totalSessions || 1;
  const avgEngagement = pages.reduce((s, p) => s + p.engagementRatePct * p.sessions, 0) / totalSessions1;
  const avgBounce = pages.reduce((s, p) => s + p.bounceRatePct * p.sessions, 0) / totalSessions1;
  const avgDuration = pages.reduce((s, p) => s + p.averageSessionDuration * p.sessions, 0) / totalSessions1;

  // Compute deltas from trend data (compare latest period to previous period)
  let clicksDelta: MetricDeltaDisplay | undefined;
  let impressionsDelta: MetricDeltaDisplay | undefined;
  let ctrDelta: MetricDeltaDisplay | undefined;
  let positionDelta: MetricDeltaDisplay | undefined;
  let sessionsDelta: MetricDeltaDisplay | undefined;
  let engagementDelta: MetricDeltaDisplay | undefined;
  let bounceDelta: MetricDeltaDisplay | undefined;
  let durationDelta: MetricDeltaDisplay | undefined;

  if (seoTrend && seoTrend.length >= 2) {
    const current = seoTrend[seoTrend.length - 1];
    const prev = seoTrend[seoTrend.length - 2];
    clicksDelta = makeDelta(current.clicks, prev.clicks);
    impressionsDelta = makeDelta(current.impressions, prev.impressions);
    ctrDelta = makeDelta(current.ctr, prev.ctr);
    // Position: lower is better, so "down" is positive
    positionDelta = makeDelta(current.avgPosition, prev.avgPosition, current.avgPosition < prev.avgPosition);
  }

  if (ga4Trend && ga4Trend.length >= 2) {
    const current = ga4Trend[ga4Trend.length - 1];
    const prev = ga4Trend[ga4Trend.length - 2];
    sessionsDelta = makeDelta(current.sessions, prev.sessions);
    engagementDelta = makeDelta(current.avgEngagement, prev.avgEngagement);
    // Bounce: lower is better, so "down" is positive
    bounceDelta = makeDelta(current.avgBounce, prev.avgBounce, current.avgBounce < prev.avgBounce);
    durationDelta = makeDelta(current.avgDuration, prev.avgDuration);
  }

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
          delta={clicksDelta}
        />
        <MetricCard
          label={metrics.totalImpressions.label}
          value={formatNumber(impressions)}
          icon={Eye}
          tooltip={metrics.totalImpressions.tooltip}
          description={metrics.totalImpressions.description}
          delta={impressionsDelta}
        />
        <MetricCard
          label={metrics.avgCTR.label}
          value={formatPercent(averageCTR(keywords))}
          icon={TrendingUp}
          tooltip={metrics.avgCTR.tooltip}
          description={metrics.avgCTR.description}
          delta={ctrDelta}
        />
        <MetricCard
          label={metrics.avgPosition.label}
          value={formatPosition(weightedAveragePosition(keywords))}
          icon={Search}
          tooltip={metrics.avgPosition.tooltip}
          description={metrics.avgPosition.description}
          delta={positionDelta}
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
            delta={sessionsDelta}
          />
          <MetricCard
            label="Avg Engagement Rate"
            value={formatPercent(avgEngagement)}
            icon={Activity}
            description="% of sessions with meaningful interaction"
            delta={engagementDelta}
          />
          <MetricCard
            label="Avg Bounce Rate"
            value={formatPercent(avgBounce)}
            icon={TrendingDown}
            description="% of sessions that left without interaction"
            delta={bounceDelta}
          />
          <MetricCard
            label="Avg Session Duration"
            value={formatDuration(avgDuration)}
            icon={Clock}
            description="Average time users spend per session"
            delta={durationDelta}
          />
        </section>
      ) : null}
    </div>
  );
}
