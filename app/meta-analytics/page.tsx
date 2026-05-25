import type { Metadata } from "next";
import { Suspense } from "react";
import { metaAnalytics } from "@/lib/meta-analytics/client";
import { COPY } from "@/lib/copy";
import { isMetaAnalyticsConfigured } from "@/lib/meta-analytics/env";
import { latestDay, uniqueAdCount, uniqueCampaignCount } from "@/lib/meta-analytics/metrics";
import { parseDateRange } from "@/lib/date-range/parse";
import { MetaHeader } from "@/components/meta-analytics/MetaHeader";
import { TopMetricsRow } from "@/components/meta-analytics/TopMetricsRow";
import { TabsNav, type MetaAnalyticsTabId } from "@/components/meta-analytics/TabsNav";
import { OverviewTab } from "@/components/meta-analytics/overview/OverviewTab";
import { CampaignsTab } from "@/components/meta-analytics/campaigns/CampaignsTab";
import { AdsTab } from "@/components/meta-analytics/ads/AdsTab";
import { DetailTab } from "@/components/meta-analytics/detail/DetailTab";
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

  const { range: dateRange, invalid: showInvalidToast } = parseDateRange(searchParams);
  const activeTab = parseTab(searchParams.tab);

  const dateRangePicker = (
    <Suspense fallback={<div className="h-8 w-28 animate-pulse rounded-full bg-surfaceElevated" />}>
      <DateRangePicker current={dateRange} showInvalidToast={showInvalidToast} />
    </Suspense>
  );

  try {
    const [campaigns, ads] = await Promise.all([
      metaAnalytics.getCampaigns(undefined, dateRange),
      metaAnalytics.getAdInsights(undefined, dateRange)
    ]);

    const lastUpdated = latestDay(campaigns) ?? latestDay(ads);
    const accountName = ads[0]?.accountName ?? null;

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <MetaHeader
          lastUpdated={lastUpdated}
          campaignCount={uniqueCampaignCount(campaigns)}
          adCount={uniqueAdCount(ads)}
          accountName={accountName}
          dateRange={dateRange}
          dateRangePicker={dateRangePicker}
        />
        <TopMetricsRow campaigns={campaigns} />
        <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surfaceElevated" />}>
          <TabsNav activeTab={activeTab} />
        </Suspense>
        {activeTab === "overview" ? <OverviewTab campaigns={campaigns} /> : null}
        {activeTab === "campaigns" ? <CampaignsTab campaigns={campaigns} dateRange={dateRange} /> : null}
        {activeTab === "ads" ? <AdsTab ads={ads} dateRange={dateRange} /> : null}
        {activeTab === "detail" ? <DetailTab ads={ads} dateRange={dateRange} /> : null}
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : COPY.metaAnalytics.loadError;
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;

    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.metaAnalytics.loadError} message={message} statusCode={statusCode} />
      </div>
    );
  }
}
