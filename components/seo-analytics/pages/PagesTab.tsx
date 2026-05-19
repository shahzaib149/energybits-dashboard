import type { GA4PageRow } from "@/lib/airtable/types";
import { EngagementVsBounce } from "@/components/seo-analytics/pages/EngagementVsBounce";
import { HighEngagementPages } from "@/components/seo-analytics/pages/HighEngagementPages";
import { PageTypeBreakdown } from "@/components/seo-analytics/pages/PageTypeBreakdown";
import { PoorPerformancePages } from "@/components/seo-analytics/pages/PoorPerformancePages";
import { TopPagesChart } from "@/components/seo-analytics/pages/TopPagesChart";

export interface PagesTabProps {
  pages: GA4PageRow[];
  highEngagement: GA4PageRow[];
  poorPerformance: GA4PageRow[];
}

export function PagesTab({ pages, highEngagement, poorPerformance }: PagesTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopPagesChart pages={pages} />
        <PageTypeBreakdown pages={pages} />
      </div>

      <HighEngagementPages rows={highEngagement} />
      <PoorPerformancePages rows={poorPerformance} />
      <EngagementVsBounce pages={pages} />
    </div>
  );
}
