"use client";

import { useState } from "react";
import { TabsNav, type SEOTabId } from "./TabsNav";
import { SearchTab } from "./search/SearchTab";
import { PagesTab } from "./pages/PagesTab";
import { SourcesTab } from "./sources/SourcesTab";
import type {
  ChannelBreakdownRow,
  GA4PageRow,
  GA4SourceRow,
  SEOTrackingRow
} from "@/lib/airtable/types";
import type { DateRange } from "@/lib/date-range/types";

interface SEOTabsContainerProps {
  initialTab: SEOTabId;
  keywords: SEOTrackingRow[];
  critical: SEOTrackingRow[];
  lowCTR: SEOTrackingRow[];
  page2: SEOTrackingRow[];
  canEditGSCStatus: boolean;
  pages: GA4PageRow[];
  highEngagement: GA4PageRow[];
  poorPerformance: GA4PageRow[];
  sources: GA4SourceRow[];
  channels: ChannelBreakdownRow[];
  dateRange: DateRange;
}

export function SEOTabsContainer({
  initialTab,
  keywords,
  critical,
  lowCTR,
  page2,
  canEditGSCStatus,
  pages,
  highEngagement,
  poorPerformance,
  sources,
  channels,
  dateRange
}: SEOTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<SEOTabId>(initialTab);

  const handleTabChange = (tab: SEOTabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <TabsNav activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "search" ? (
        <SearchTab
          keywords={keywords}
          critical={critical}
          lowCTR={lowCTR}
          page2={page2}
          canEditGSCStatus={canEditGSCStatus}
          dateRange={dateRange}
        />
      ) : null}

      {activeTab === "pages" ? (
        <PagesTab
          pages={pages}
          highEngagement={highEngagement}
          poorPerformance={poorPerformance}
          dateRange={dateRange}
        />
      ) : null}

      {activeTab === "sources" ? (
        <SourcesTab sources={sources} channels={channels} dateRange={dateRange} />
      ) : null}
    </div>
  );
}
