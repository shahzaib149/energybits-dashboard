import type { Metadata } from "next";
import { Suspense } from "react";
import { googleAds } from "@/lib/google-ads/client";
import { COPY } from "@/lib/copy";
import { isGoogleAdsConfigured } from "@/lib/google-ads/env";
import { latestPulledAt } from "@/lib/google-ads/metrics";
import { GoogleAdsHeader } from "@/components/google-ads/GoogleAdsHeader";
import { TopMetricsRow } from "@/components/google-ads/TopMetricsRow";
import { TabsNav, type GoogleAdsTabId } from "@/components/google-ads/TabsNav";
import { CampaignsTab } from "@/components/google-ads/campaigns/CampaignsTab";
import { AdGroupsTab } from "@/components/google-ads/ad-groups/AdGroupsTab";
import { CreativesTab } from "@/components/google-ads/creatives/CreativesTab";
import { KeywordsTab } from "@/components/google-ads/keywords/KeywordsTab";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AirtableAPIError } from "@/lib/airtable/errors";

export const metadata: Metadata = {
  title: COPY.googleAds.meta.title,
  description: COPY.googleAds.meta.description
};

export const revalidate = 300;

function parseTab(tab?: string): GoogleAdsTabId {
  if (tab === "ad-groups" || tab === "creatives" || tab === "keywords") return tab;
  return "campaigns";
}

export default async function GoogleAdsAnalyticsPage({
  searchParams
}: {
  searchParams: { tab?: string };
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

  const activeTab = parseTab(searchParams.tab);

  try {
    const [campaigns, adGroups, creatives, keywords] = await Promise.all([
      googleAds.getCampaigns(),
      googleAds.getAdGroups(),
      googleAds.getCreatives(),
      googleAds.getKeywords()
    ]);

    const lastUpdated = latestPulledAt([...campaigns, ...adGroups, ...creatives, ...keywords]);
    const accountName = campaigns[0]?.accountName ?? adGroups[0]?.accountName ?? null;

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <GoogleAdsHeader lastUpdated={lastUpdated} campaignCount={campaigns.length} accountName={accountName} />
        <TopMetricsRow campaigns={campaigns} />

        <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surfaceElevated" />}>
          <TabsNav activeTab={activeTab} />
        </Suspense>

        {activeTab === "campaigns" ? <CampaignsTab campaigns={campaigns} /> : null}
        {activeTab === "ad-groups" ? <AdGroupsTab adGroups={adGroups} /> : null}
        {activeTab === "creatives" ? <CreativesTab creatives={creatives} /> : null}
        {activeTab === "keywords" ? <KeywordsTab keywords={keywords} /> : null}
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : COPY.googleAds.loadError;
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;

    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.googleAds.loadError} message={message} statusCode={statusCode} />
      </div>
    );
  }
}
