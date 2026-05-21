import type { GoogleAdsCampaignRow } from "@/lib/google-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { ChannelTypeBreakdown, TopCampaignsSpendChart } from "@/components/google-ads/campaigns/CampaignCharts";
import { ImpressionSharePanel } from "@/components/google-ads/campaigns/ImpressionSharePanel";
import { CampaignPerformanceTable, TopROASCampaigns } from "@/components/google-ads/campaigns/CampaignTables";

export function CampaignsTab({
  campaigns,
  dateRange
}: {
  campaigns: GoogleAdsCampaignRow[];
  dateRange: DateRange;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopCampaignsSpendChart campaigns={campaigns} />
        <ChannelTypeBreakdown campaigns={campaigns} />
      </div>
      <ImpressionSharePanel campaigns={campaigns} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CampaignPerformanceTable campaigns={campaigns} dateRange={dateRange} />
        </div>
        <TopROASCampaigns campaigns={campaigns} />
      </div>
    </div>
  );
}
