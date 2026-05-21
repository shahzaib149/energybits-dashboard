import type { Metadata } from "next";
import { Suspense } from "react";
import { criteoAds } from "@/lib/criteo-ads/client";
import { COPY } from "@/lib/copy";
import { isCriteoAdsConfigured } from "@/lib/criteo-ads/env";
import { latestDay, uniqueCampaignCount } from "@/lib/criteo-ads/metrics";
import { parseDateRange } from "@/lib/date-range/parse";
import { CriteoAdsHeader } from "@/components/criteo-ads/CriteoAdsHeader";
import { TopMetricsRow } from "@/components/criteo-ads/TopMetricsRow";
import { TabsNav, type CriteoAdsTabId } from "@/components/criteo-ads/TabsNav";
import { OverviewTab } from "@/components/criteo-ads/overview/OverviewTab";
import { CampaignsTab } from "@/components/criteo-ads/campaigns/CampaignsTab";
import { AdsTab } from "@/components/criteo-ads/ads/AdsTab";
import { DailyTab } from "@/components/criteo-ads/daily/DailyTab";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AirtableAPIError } from "@/lib/airtable/errors";

export const metadata: Metadata = {
  title: COPY.criteoAds.meta.title,
  description: COPY.criteoAds.meta.description
};

export const revalidate = 300;

function parseTab(tab?: string): CriteoAdsTabId {
  if (tab === "campaigns" || tab === "ads" || tab === "daily") return tab;
  return "overview";
}

export default async function CriteoAdsAnalyticsPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  if (!isCriteoAdsConfigured()) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState
          title={COPY.criteoAds.notConfigured.title}
          description={COPY.criteoAds.notConfigured.description}
        />
      </div>
    );
  }

  const { range: dateRange, invalid: showInvalidToast } = parseDateRange(searchParams);
  const activeTab = parseTab(searchParams.tab);

  const dateRangePicker = (
    <Suspense fallback={<div className="h-8 w-28 animate-pulse rounded-full bg-surfaceElevated" />}>
      <DateRangePicker current={dateRange} showInvalidToast={showInvalidToast} />
    </Suspense>
  );

  try {
    const [daily, overall] = await Promise.all([
      criteoAds.getDailyAnalytics(undefined, dateRange),
      criteoAds.getOverallAnalytics()
    ]);

    const lastUpdated = latestDay(daily);
    const campaignCount = uniqueCampaignCount(daily);

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <CriteoAdsHeader
          lastUpdated={lastUpdated}
          campaignCount={campaignCount}
          recordCount={daily.length}
          dateRange={dateRange}
          dateRangePicker={dateRangePicker}
        />
        <TopMetricsRow daily={daily} />

        <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surfaceElevated" />}>
          <TabsNav activeTab={activeTab} />
        </Suspense>

        {activeTab === "overview" ? <OverviewTab daily={daily} overall={overall} /> : null}
        {activeTab === "campaigns" ? <CampaignsTab daily={daily} dateRange={dateRange} /> : null}
        {activeTab === "ads" ? <AdsTab daily={daily} dateRange={dateRange} /> : null}
        {activeTab === "daily" ? <DailyTab daily={daily} dateRange={dateRange} /> : null}
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : COPY.criteoAds.loadError;
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;

    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.criteoAds.loadError} message={message} statusCode={statusCode} />
      </div>
    );
  }
}
