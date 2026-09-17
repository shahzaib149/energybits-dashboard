"use client";

import { useState } from "react";
import { TabsNav, type CriteoAdsTabId } from "./TabsNav";
import { OverviewTab } from "./overview/OverviewTab";
import { CampaignsTab } from "./campaigns/CampaignsTab";
import { AdsTab } from "./ads/AdsTab";
import { DailyTab } from "./daily/DailyTab";
import type { CriteoDailyRow, CriteoOverallRow } from "@/lib/criteo-ads/types";
import type { DateRange } from "@/lib/date-range/types";

interface CriteoAdsTabsContainerProps {
  initialTab: CriteoAdsTabId;
  daily: CriteoDailyRow[];
  overall: CriteoOverallRow | null;
  dateRange: DateRange;
}

export function CriteoAdsTabsContainer({
  initialTab,
  daily,
  overall,
  dateRange
}: CriteoAdsTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<CriteoAdsTabId>(initialTab);

  const handleTabChange = (tab: CriteoAdsTabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <TabsNav activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "overview" ? (
        <OverviewTab daily={daily} overall={overall} />
      ) : null}
      {activeTab === "campaigns" ? (
        <CampaignsTab daily={daily} dateRange={dateRange} />
      ) : null}
      {activeTab === "ads" ? (
        <AdsTab daily={daily} dateRange={dateRange} />
      ) : null}
      {activeTab === "daily" ? (
        <DailyTab daily={daily} dateRange={dateRange} />
      ) : null}
    </div>
  );
}
