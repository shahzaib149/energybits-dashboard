import type { Metadata } from "next";
import { Suspense } from "react";
import { metaAnalytics } from "@/lib/meta-analytics/client";
import { COPY } from "@/lib/copy";
import { isMetaAnalyticsConfigured } from "@/lib/meta-analytics/env";
import { deduplicateCampaignRows, latestDay, uniqueAdCount, uniqueCampaignCount } from "@/lib/meta-analytics/metrics";
import { parseDateRangeWithBounds } from "@/lib/date-range/parse";
import { MetaHeader } from "@/components/meta-analytics/MetaHeader";
import { TopMetricsRow } from "@/components/meta-analytics/TopMetricsRow";
import { MetaAnalyticsTabsContainer } from "@/components/meta-analytics/MetaAnalyticsTabsContainer";
import type { MetaAnalyticsTabId } from "@/components/meta-analytics/TabsNav";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AirtableAPIError } from "@/lib/airtable/errors";

export const metadata: Metadata = {
  title: COPY.metaAnalytics.meta.title,
  description: COPY.metaAnalytics.meta.description
};

export const revalidate = 300;

function parseTab(tab?: string): MetaAnalyticsTabId {
  if (tab === "campaigns" || tab === "ads" || tab === "detail") return tab;
  return "overview";
}

export default async function MetaAnalyticsPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  if (!isMetaAnalyticsConfigured()) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState
          title={COPY.metaAnalytics.notConfigured.title}
          description={COPY.metaAnalytics.notConfigured.description}
        />
      </div>
    );
  }

  const dataBounds = await metaAnalytics.getDataBounds();
  const { range: dateRange, invalid: showInvalidToast } = parseDateRangeWithBounds(searchParams, dataBounds);
  const activeTab = parseTab(searchParams.tab);

  const dateRangePicker = (
    <Suspense fallback={<div className="h-8 w-28 animate-pulse rounded-full bg-surfaceElevated" />}>
      <DateRangePicker current={dateRange} showInvalidToast={showInvalidToast} dataBounds={dataBounds} />
    </Suspense>
  );

  try {
    const [rawCampaigns, ads] = await Promise.all([
      metaAnalytics.getCampaigns(undefined, dateRange),
      metaAnalytics.getAdInsights(undefined, dateRange)
    ]);

    // Remove duplicate records — Make.com occasionally syncs the same campaign/day twice.
    // Deduplicating here ensures every metric (spend, clicks, impressions) is accurate.
    const campaigns = deduplicateCampaignRows(rawCampaigns);

    const lastUpdated = latestDay(campaigns);
    const accountName = ads[0]?.accountName ?? null;

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <MetaHeader
          lastUpdated={lastUpdated}
          campaignCount={uniqueCampaignCount(campaigns)}
          adCount={uniqueAdCount(ads)}
          accountName={accountName}
          dateRange={dateRange}
          dataBounds={dataBounds}
          dateRangePicker={dateRangePicker}
        />
        <TopMetricsRow campaigns={campaigns} />

        <MetaAnalyticsTabsContainer
          initialTab={activeTab}
          campaigns={campaigns}
          ads={ads}
          dateRange={dateRange}
        />
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : COPY.metaAnalytics.loadError;
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;

    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.metaAnalytics.loadError} message={message} statusCode={statusCode} showRetry />
      </div>
    );
  }
}
