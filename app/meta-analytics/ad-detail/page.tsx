import type { Metadata } from "next";
import { metaAnalytics } from "@/lib/meta-analytics/client";
import { isMetaAnalyticsConfigured } from "@/lib/meta-analytics/env";
import { AdDetailClient } from "@/components/meta-analytics/ads/AdDetailClient";
import { ErrorState } from "@/components/ui/ErrorState";
import { AirtableAPIError } from "@/lib/airtable/errors";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}): Promise<Metadata> {
  const name = searchParams.name ? searchParams.name : "Ad Detail";
  return { title: `${name} — Meta Ad` };
}

export default async function MetaAdDetailPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const adName = searchParams.name ? searchParams.name : "";

  if (!isMetaAnalyticsConfigured() || !adName) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title="Not found" message="No ad name provided." />
      </div>
    );
  }

  try {
    const rows = await metaAnalytics.getAdInsightsByName(adName);
    return <AdDetailClient adName={adName} rows={rows} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load ad data.";
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title="Failed to load ad" message={message} statusCode={statusCode} showRetry />
      </div>
    );
  }
}
