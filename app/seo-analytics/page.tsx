import type { Metadata } from "next";
import { Suspense } from "react";
import { airtable } from "@/lib/airtable/client";
import { COPY } from "@/lib/copy";
import { isSEOAnalyticsConfigured } from "@/lib/seo-analytics/env";
import { latestEndDate } from "@/lib/seo-analytics/metrics";
import { SEOAnalyticsHeader } from "@/components/seo-analytics/SEOAnalyticsHeader";
import { TopMetricsRow } from "@/components/seo-analytics/TopMetricsRow";
import { TabsNav, type SEOTabId } from "@/components/seo-analytics/TabsNav";
import { SearchTab } from "@/components/seo-analytics/search/SearchTab";
import { PagesTab } from "@/components/seo-analytics/pages/PagesTab";
import { SourcesTab } from "@/components/seo-analytics/sources/SourcesTab";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AirtableAPIError } from "@/lib/airtable/errors";

export const metadata: Metadata = {
  title: COPY.seoAnalytics.meta.title,
  description: COPY.seoAnalytics.meta.description
};

export const revalidate = 300;

function parseTab(tab?: string): SEOTabId {
  if (tab === "pages" || tab === "sources") return tab;
  return "search";
}

export default async function SEOAnalyticsPage({
  searchParams
}: {
  searchParams: { tab?: string };
}) {
  if (!isSEOAnalyticsConfigured()) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState
          title={COPY.seoAnalytics.notConfigured.title}
          description={COPY.seoAnalytics.notConfigured.description}
        />
      </div>
    );
  }

  const activeTab = parseTab(searchParams.tab);

  try {
    const [keywords, pages, sources, critical, lowCTR, page2, highEngagement, poorPerformance, channels] =
      await Promise.all([
        airtable.getSEOKeywords({ limit: 500 }),
        airtable.getTopPagesBySessions(50),
        airtable.getTrafficSources(50),
        airtable.getCriticalKeywords(),
        airtable.getLowCTRKeywords(),
        airtable.getPage2Opportunities(),
        airtable.getHighEngagementPages(),
        airtable.getPoorPerformancePages(),
        airtable.getChannelBreakdown()
      ]);

    const lastUpdated = latestEndDate([...keywords, ...pages, ...sources]);

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <SEOAnalyticsHeader lastUpdated={lastUpdated} totalKeywords={keywords.length} />
        <TopMetricsRow keywords={keywords} pages={pages} />

        <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surfaceElevated" />}>
          <TabsNav activeTab={activeTab} />
        </Suspense>

        {activeTab === "search" ? (
          <SearchTab keywords={keywords} critical={critical} lowCTR={lowCTR} page2={page2} />
        ) : null}
        {activeTab === "pages" ? (
          <PagesTab pages={pages} highEngagement={highEngagement} poorPerformance={poorPerformance} />
        ) : null}
        {activeTab === "sources" ? <SourcesTab sources={sources} channels={channels} /> : null}
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : COPY.seoAnalytics.loadError;
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;

    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.seoAnalytics.loadError} message={message} statusCode={statusCode} />
      </div>
    );
  }
}
