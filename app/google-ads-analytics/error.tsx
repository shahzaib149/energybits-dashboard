"use client";

import { useEffect } from "react";
import { COPY } from "@/lib/copy";
import { ErrorState } from "@/components/ui/ErrorState";

export default function GoogleAdsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Google Ads Analytics error");
  }, [error]);

  return (
    <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
      <ErrorState title={COPY.googleAds.loadError} message={error.message || COPY.googleAds.loadError} onRetry={reset} />
    </div>
  );
}
