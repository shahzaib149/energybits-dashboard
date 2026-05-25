import type { Metadata } from "next";
import { Suspense } from "react";
import { klaviyo } from "@/lib/klaviyo/client";
import { COPY } from "@/lib/copy";
import { isKlaviyoConfigured } from "@/lib/klaviyo/env";
import { latestDay, uniqueMetricCount } from "@/lib/klaviyo/metrics";
import { parseDateRange } from "@/lib/date-range/parse";
import { KlaviyoHeader } from "@/components/klaviyo/KlaviyoHeader";
import { TopMetricsRow } from "@/components/klaviyo/TopMetricsRow";
import { TabsNav, type KlaviyoTabId } from "@/components/klaviyo/TabsNav";
import { OverviewTab } from "@/components/klaviyo/overview/OverviewTab";
import { MetricsTab } from "@/components/klaviyo/metrics/MetricsTab";
import { RecordsTab } from "@/components/klaviyo/records/RecordsTab";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AirtableAPIError } from "@/lib/airtable/errors";

export const metadata: Metadata = {
  title: COPY.klaviyo.meta.title,
  description: COPY.klaviyo.meta.description
};
export const revalidate = 300;

function parseTab(tab?: string): KlaviyoTabId {
  if (tab === "metrics" || tab === "records") return tab;
  return "overview";
}

export default async function KlaviyoAnalyticsPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  if (!isKlaviyoConfigured()) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState title={COPY.klaviyo.notConfigured.title} description={COPY.klaviyo.notConfigured.description} />
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
    const rows = await klaviyo.getAnalytics(undefined, dateRange);
    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <KlaviyoHeader
          lastUpdated={latestDay(rows)}
          metricCount={uniqueMetricCount(rows)}
          recordCount={rows.length}
          dateRange={dateRange}
          dateRangePicker={dateRangePicker}
        />
        <TopMetricsRow rows={rows} />
        <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surfaceElevated" />}>
          <TabsNav activeTab={activeTab} />
        </Suspense>
        {activeTab === "overview" ? <OverviewTab rows={rows} /> : null}
        {activeTab === "metrics" ? <MetricsTab rows={rows} dateRange={dateRange} /> : null}
        {activeTab === "records" ? <RecordsTab rows={rows} dateRange={dateRange} /> : null}
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : COPY.klaviyo.loadError;
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.klaviyo.loadError} message={message} statusCode={statusCode} />
      </div>
    );
  }
}
