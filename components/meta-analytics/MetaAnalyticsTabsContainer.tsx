"use client";

import { useState } from "react";
import { TabsNav, type MetaAnalyticsTabId } from "./TabsNav";
import { OverviewTab } from "./overview/OverviewTab";
import { CampaignsTab } from "./campaigns/CampaignsTab";
import { AdsTab } from "./ads/AdsTab";
import { DetailTab } from "./detail/DetailTab";
import type { MetaCampaignRow, MetaAdInsightRow } from "@/lib/meta-analytics/types";
import type { DateRange } from "@/lib/date-range/types";

interface MetaAnalyticsTabsContainerProps {
  initialTab: MetaAnalyticsTabId;
  campaigns: MetaCampaignRow[];
  ads: MetaAdInsightRow[];
  dateRange: DateRange;
}

export function MetaAnalyticsTabsContainer({
  initialTab,
  campaigns,
  ads,
  dateRange
}: MetaAnalyticsTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<MetaAnalyticsTabId>(initialTab);

  const handleTabChange = (tab: MetaAnalyticsTabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <TabsNav activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "overview" ? (
        <OverviewTab campaigns={campaigns} ads={ads} />
      ) : null}
      {activeTab === "campaigns" ? (
        <CampaignsTab campaigns={campaigns} dateRange={dateRange} />
      ) : null}
      {activeTab === "ads" ? (
        <AdsTab ads={ads} dateRange={dateRange} />
      ) : null}
      {activeTab === "detail" ? (
        <DetailTab ads={ads} dateRange={dateRange} />
      ) : null}
    </div>
  );
}
