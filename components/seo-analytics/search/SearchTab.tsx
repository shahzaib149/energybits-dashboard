"use client";

import type { SEOTrackingRow } from "@/lib/airtable/types";
import type { DateRange } from "@/lib/date-range/types";
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
  canEditGSCStatus: boolean;
  dateRange: DateRange;
}

export function SearchTab({
  keywords,
  critical,
  lowCTR,
  page2,
  canEditGSCStatus,
  dateRange
}: SearchTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopKeywordsChart keywords={keywords} dateRange={dateRange} />
        <PositionDistribution keywords={keywords} />
      </div>

      <CriticalOpportunities rows={critical} canEdit={canEditGSCStatus} dateRange={dateRange} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <LowCTRTable rows={lowCTR} canEdit={canEditGSCStatus} dateRange={dateRange} />
          <Page2Opportunities rows={page2} canEdit={canEditGSCStatus} dateRange={dateRange} />
        </div>
        <PriorityBreakdown keywords={keywords} />
      </div>
    </div>
  );
}
