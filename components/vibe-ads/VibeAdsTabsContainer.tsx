"use client";

import { useState } from "react";
import { TabsNav, type VibeAdsTabId } from "./TabsNav";
import { OverviewTab } from "./overview/OverviewTab";
import { CampaignsTab, ChannelsTab, CreativesTab } from "./AggregatedTabs";
import { DetailTab } from "./detail/DetailTab";
import type { VibeAnalyticsRow } from "@/lib/vibe-ads/types";
import type { DateRange } from "@/lib/date-range/types";

interface VibeAdsTabsContainerProps {
  initialTab: VibeAdsTabId;
  rows: VibeAnalyticsRow[];
  dateRange: DateRange;
}

export function VibeAdsTabsContainer({
  initialTab,
  rows,
  dateRange
}: VibeAdsTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<VibeAdsTabId>(initialTab);

  const handleTabChange = (tab: VibeAdsTabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <TabsNav activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "overview" ? <OverviewTab rows={rows} /> : null}
      {activeTab === "campaigns" ? <CampaignsTab rows={rows} dateRange={dateRange} /> : null}
      {activeTab === "channels" ? <ChannelsTab rows={rows} dateRange={dateRange} /> : null}
      {activeTab === "creatives" ? <CreativesTab rows={rows} dateRange={dateRange} /> : null}
      {activeTab === "detail" ? <DetailTab rows={rows} dateRange={dateRange} /> : null}
    </div>
  );
}
