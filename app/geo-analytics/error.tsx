"use client";

import { useEffect } from "react";
import { COPY } from "@/lib/copy";
import { ErrorState } from "@/components/ui/ErrorState";

export default function GEOAnalyticsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GEO Analytics error");
  }, [error]);

  return (
    <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
      <ErrorState title={COPY.geoAnalytics.loadError} message={error.message || COPY.geoAnalytics.loadError} onRetry={reset} />
    </div>
  );
}
