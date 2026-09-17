"use client";

import { useState } from "react";
import { TabsNav, type GoogleAdsTabId } from "./TabsNav";
import { CampaignsTab } from "./campaigns/CampaignsTab";
import { AdGroupsTab } from "./ad-groups/AdGroupsTab";
import { CreativesTab } from "./creatives/CreativesTab";
import { KeywordsTab } from "./keywords/KeywordsTab";
import type {
  GoogleAdsCampaignRow,
  GoogleAdsAdGroupRow,
  GoogleAdsCreativeRow,
  GoogleAdsKeywordRow
} from "@/lib/google-ads/types";
import type { DateRange } from "@/lib/date-range/types";

interface GoogleAdsTabsContainerProps {
  initialTab: GoogleAdsTabId;
  campaigns: GoogleAdsCampaignRow[];
  adGroups: GoogleAdsAdGroupRow[];
  creatives: GoogleAdsCreativeRow[];
  keywords: GoogleAdsKeywordRow[];
  dateRange: DateRange;
}

export function GoogleAdsTabsContainer({
  initialTab,
  campaigns,
  adGroups,
  creatives,
  keywords,
  dateRange
}: GoogleAdsTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<GoogleAdsTabId>(initialTab);

  const handleTabChange = (tab: GoogleAdsTabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <TabsNav activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "campaigns" ? (
        <CampaignsTab campaigns={campaigns} dateRange={dateRange} />
      ) : null}
      {activeTab === "ad-groups" ? (
        <AdGroupsTab adGroups={adGroups} dateRange={dateRange} />
      ) : null}
      {activeTab === "creatives" ? (
        <CreativesTab creatives={creatives} campaigns={campaigns} dateRange={dateRange} />
      ) : null}
      {activeTab === "keywords" ? (
        <KeywordsTab keywords={keywords} dateRange={dateRange} />
      ) : null}
    </div>
  );
}
