import type { SEOTrackingRow } from "@/lib/airtable/types";
import { CriticalOpportunities } from "@/components/seo-analytics/search/CriticalOpportunities";
import { LowCTRTable } from "@/components/seo-analytics/search/LowCTRTable";
import { Page2Opportunities } from "@/components/seo-analytics/search/Page2Opportunities";
import { PositionDistribution } from "@/components/seo-analytics/search/PositionDistribution";
import { PriorityBreakdown } from "@/components/seo-analytics/search/PriorityBreakdown";
import { TopKeywordsChart } from "@/components/seo-analytics/search/TopKeywordsChart";

export interface SearchTabProps {
  keywords: SEOTrackingRow[];
  critical: SEOTrackingRow[];
  lowCTR: SEOTrackingRow[];
  page2: SEOTrackingRow[];
}

export function SearchTab({ keywords, critical, lowCTR, page2 }: SearchTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopKeywordsChart keywords={keywords} />
        <PositionDistribution keywords={keywords} />
      </div>

      <CriticalOpportunities rows={critical} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <LowCTRTable rows={lowCTR} />
          <Page2Opportunities rows={page2} />
        </div>
        <PriorityBreakdown keywords={keywords} />
      </div>
    </div>
  );
}
