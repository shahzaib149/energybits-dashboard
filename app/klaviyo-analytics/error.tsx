"use client";

import { COPY } from "@/lib/copy";
import { ErrorState } from "@/components/ui/ErrorState";

export default function KlaviyoError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
      <ErrorState title={COPY.klaviyo.loadError} message={error.message || COPY.klaviyo.loadError} onRetry={reset} />
    </div>
  );
}
