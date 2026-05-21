import type { ChannelBreakdownRow, GA4SourceRow } from "@/lib/airtable/types";
import type { DateRange } from "@/lib/date-range/types";
import { ChannelDonut } from "@/components/seo-analytics/sources/ChannelDonut";
import { EngagementByChannel } from "@/components/seo-analytics/sources/EngagementByChannel";
import { SourceMediumBars } from "@/components/seo-analytics/sources/SourceMediumBars";
import { TopSourcesTable } from "@/components/seo-analytics/sources/TopSourcesTable";

export interface SourcesTabProps {
  sources: GA4SourceRow[];
  channels: ChannelBreakdownRow[];
  dateRange: DateRange;
}

export function SourcesTab({ sources, channels, dateRange }: SourcesTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChannelDonut channels={channels} />
        <SourceMediumBars sources={sources} />
      </div>

      <TopSourcesTable sources={sources} dateRange={dateRange} />
      <EngagementByChannel sources={sources} />
    </div>
  );
}
