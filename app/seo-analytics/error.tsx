"use client";

import { useEffect } from "react";
import { COPY } from "@/lib/copy";
import { ErrorState } from "@/components/ui/ErrorState";

export default function SEOAnalyticsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SEO Analytics error");
  }, [error]);

  return (
    <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
      <ErrorState title={COPY.seoAnalytics.loadError} message={error.message || COPY.seoAnalytics.loadError} onRetry={reset} />
    </div>
  );
}
