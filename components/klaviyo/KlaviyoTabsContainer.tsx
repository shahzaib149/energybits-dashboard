"use client";

import { useState } from "react";
import { TabsNav, type KlaviyoTabId } from "./TabsNav";
import { OverviewTab } from "./overview/OverviewTab";
import { MetricsTab } from "./metrics/MetricsTab";
import { RecordsTab } from "./records/RecordsTab";
import type { KlaviyoAnalyticsRow } from "@/lib/klaviyo/types";
import type { DateRange } from "@/lib/date-range/types";

interface KlaviyoTabsContainerProps {
  initialTab: KlaviyoTabId;
  rows: KlaviyoAnalyticsRow[];
  dateRange: DateRange;
}

export function KlaviyoTabsContainer({
  initialTab,
  rows,
  dateRange
}: KlaviyoTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<KlaviyoTabId>(initialTab);

  const handleTabChange = (tab: KlaviyoTabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <TabsNav activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "overview" ? <OverviewTab rows={rows} /> : null}
      {activeTab === "metrics" ? <MetricsTab rows={rows} dateRange={dateRange} /> : null}
      {activeTab === "records" ? <RecordsTab rows={rows} dateRange={dateRange} /> : null}
    </div>
  );
}
