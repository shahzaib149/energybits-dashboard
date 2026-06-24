import type { Metadata } from "next";
import { googleAds } from "@/lib/google-ads/client";
import { isGoogleAdsConfigured } from "@/lib/google-ads/env";
import { CreativeDetailClient } from "@/components/google-ads/creatives/CreativeDetailClient";
import { ErrorState } from "@/components/ui/ErrorState";
import { AirtableAPIError } from "@/lib/airtable/errors";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}): Promise<Metadata> {
  const name = searchParams.name ?? "Creative Detail";
  return { title: `${name} — Google Ad` };
}

export default async function GoogleCreativeDetailPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const adName = searchParams.name ?? "";

  if (!isGoogleAdsConfigured() || !adName) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title="Not found" message="No ad name provided." />
      </div>
    );
  }

  try {
    const [rows, campaigns] = await Promise.all([
      googleAds.getCreativesByName(adName),
      googleAds.getCampaigns()
    ]);
    return <CreativeDetailClient adName={adName} rows={rows} campaigns={campaigns} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load creative data.";
    const statusCode = err instanceof AirtableAPIError ? err.status : 500;
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title="Failed to load creative" message={message} statusCode={statusCode} showRetry />
      </div>
    );
  }
}
