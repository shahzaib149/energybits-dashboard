import type { Metadata } from "next";
import { Suspense } from "react";
import { vibeAds } from "@/lib/vibe-ads/client";
import { COPY } from "@/lib/copy";
import { isVibeAdsConfigured } from "@/lib/vibe-ads/env";
import { latestDay, uniqueCampaignCount } from "@/lib/vibe-ads/metrics";
import { parseDateRangeWithBounds } from "@/lib/date-range/parse";
import { VibeAdsHeader } from "@/components/vibe-ads/VibeAdsHeader";
import { TopMetricsRow } from "@/components/vibe-ads/TopMetricsRow";
import { TabsNav, type VibeAdsTabId } from "@/components/vibe-ads/TabsNav";
import { OverviewTab } from "@/components/vibe-ads/overview/OverviewTab";
import { CampaignsTab, ChannelsTab, CreativesTab } from "@/components/vibe-ads/AggregatedTabs";
import { DetailTab } from "@/components/vibe-ads/detail/DetailTab";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AirtableAPIError } from "@/lib/airtable/errors";

export const metadata: Metadata = {
  title: COPY.vibeAds.meta.title,
  description: COPY.vibeAds.meta.description
};

function parseTab(tab?: string): VibeAdsTabId {
  if (tab === "campaigns" || tab === "channels" || tab === "creatives" || tab === "detail") return tab;
  return "overview";
}

export default async function VibeAdsAnalyticsPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  if (!isVibeAdsConfigured()) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState title={COPY.vibeAds.notConfigured.title} description={COPY.vibeAds.notConfigured.description} />
      </div>
    );
  }

  const dataBounds = await vibeAds.getDataBounds();
  const { range: dateRange, invalid: showInvalidToast } = parseDateRangeWithBounds(searchParams, dataBounds);
  const activeTab = parseTab(searchParams.tab);

  const dateRangePicker = (
    <Suspense fallback={<div className="h-8 w-28 animate-pulse rounded-full bg-surfaceElevated" />}>
      <DateRangePicker current={dateRange} showInvalidToast={showInvalidToast} dataBounds={dataBounds} />
    </Suspense>
  );

  try {
    const rows = await vibeAds.getAnalytics(undefined, dateRange);

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <VibeAdsHeader
          lastUpdated={latestDay(rows)}
          campaignCount={uniqueCampaignCount(rows)}
          recordCount={rows.length}
          dateRange={dateRange}
          dataBounds={dataBounds}
          dateRangePicker={dateRangePicker}
        />
        <TopMetricsRow rows={rows} />

        <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surfaceElevated" />}>
          <TabsNav activeTab={activeTab} />
        </Suspense>

        {activeTab === "overview" ? <OverviewTab rows={rows} /> : null}
        {activeTab === "campaigns" ? <CampaignsTab rows={rows} dateRange={dateRange} /> : null}
        {activeTab === "channels" ? <ChannelsTab rows={rows} dateRange={dateRange} /> : null}
        {activeTab === "creatives" ? <CreativesTab rows={rows} dateRange={dateRange} /> : null}
        {activeTab === "detail" ? <DetailTab rows={rows} dateRange={dateRange} /> : null}
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : COPY.vibeAds.loadError;
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;

    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.vibeAds.loadError} message={message} statusCode={statusCode} showRetry />
      </div>
    );
  }
}
