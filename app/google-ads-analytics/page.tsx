import type { Metadata } from "next";
import { Suspense } from "react";
import { googleAds } from "@/lib/google-ads/client";
import { COPY } from "@/lib/copy";
import { isGoogleAdsConfigured } from "@/lib/google-ads/env";
import { latestPulledAt } from "@/lib/google-ads/metrics";
import { parseDateRangeWithBounds } from "@/lib/date-range/parse";
import { GoogleAdsHeader } from "@/components/google-ads/GoogleAdsHeader";
import { TopMetricsRow } from "@/components/google-ads/TopMetricsRow";
import { TabsNav, type GoogleAdsTabId } from "@/components/google-ads/TabsNav";
import { CampaignsTab } from "@/components/google-ads/campaigns/CampaignsTab";
import { AdGroupsTab } from "@/components/google-ads/ad-groups/AdGroupsTab";
import { CreativesTab } from "@/components/google-ads/creatives/CreativesTab";
import { KeywordsTab } from "@/components/google-ads/keywords/KeywordsTab";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AirtableAPIError } from "@/lib/airtable/errors";

export const metadata: Metadata = {
  title: COPY.googleAds.meta.title,
  description: COPY.googleAds.meta.description
};

function parseTab(tab?: string): GoogleAdsTabId {
  if (tab === "ad-groups" || tab === "creatives" || tab === "keywords") return tab;
  return "campaigns";
}

export default async function GoogleAdsAnalyticsPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  if (!isGoogleAdsConfigured()) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState
          title={COPY.googleAds.notConfigured.title}
          description={COPY.googleAds.notConfigured.description}
        />
      </div>
    );
  }

  // Fetch actual data bounds first (always fresh, no cache).
  // This tells us the real min/max date in Airtable so the filter never
  // shows "Last 28 days" anchored to today when today's data doesn't exist yet.
  const dataBounds = await googleAds.getDataBounds();

  const { range: dateRange, invalid: showInvalidToast } = parseDateRangeWithBounds(
    searchParams,
    dataBounds
  );

  const activeTab = parseTab(searchParams.tab);

  const dateRangePicker = (
    <Suspense fallback={<div className="h-8 w-28 animate-pulse rounded-full bg-surfaceElevated" />}>
      <DateRangePicker
        current={dateRange}
        showInvalidToast={showInvalidToast}
        dataBounds={dataBounds}
      />
    </Suspense>
  );

  try {
    const [campaigns, adGroups, creatives, keywords] = await Promise.all([
      googleAds.getCampaigns(undefined, dateRange),
      googleAds.getAdGroups(undefined, dateRange),
      googleAds.getCreatives(undefined, dateRange),
      googleAds.getKeywords(undefined, dateRange)
    ]);

    const lastUpdated = latestPulledAt([...campaigns, ...adGroups, ...creatives, ...keywords]);
    const accountName = campaigns[0]?.accountName ?? adGroups[0]?.accountName ?? null;

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <GoogleAdsHeader
          lastUpdated={lastUpdated}
          campaignCount={campaigns.length}
          accountName={accountName}
          dateRange={dateRange}
          dataBounds={dataBounds}
          dateRangePicker={dateRangePicker}
        />
        <TopMetricsRow campaigns={campaigns} />

        <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surfaceElevated" />}>
          <TabsNav activeTab={activeTab} />
        </Suspense>

        {activeTab === "campaigns" ? <CampaignsTab campaigns={campaigns} dateRange={dateRange} /> : null}
        {activeTab === "ad-groups" ? <AdGroupsTab adGroups={adGroups} dateRange={dateRange} /> : null}
        {activeTab === "creatives" ? <CreativesTab creatives={creatives} campaigns={campaigns} dateRange={dateRange} /> : null}
        {activeTab === "keywords" ? <KeywordsTab keywords={keywords} dateRange={dateRange} /> : null}
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : COPY.googleAds.loadError;
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;

    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.googleAds.loadError} message={message} statusCode={statusCode} showRetry />
      </div>
    );
  }
}
