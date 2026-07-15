import type { SEOTrendPoint, ChannelTrendPoint } from "@/lib/seo-analytics/trends";
import { PerformanceTrendChart } from "@/components/seo-analytics/trends/PerformanceTrendChart";

export interface TrendsSectionProps {
  seoTrend: SEOTrendPoint[];
  channelTrend: ChannelTrendPoint[];
  channels: string[];
}

export function TrendsSection({ seoTrend, channelTrend, channels }: TrendsSectionProps) {
  const hasTrendData = seoTrend.length > 1 || channelTrend.length > 1;

  if (!hasTrendData) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-textPrimary">Performance Trends</h2>
      <PerformanceTrendChart seoTrend={seoTrend} channelTrend={channelTrend} channels={channels} />
    </div>
  );
}
