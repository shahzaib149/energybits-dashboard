"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { COPY } from "@/lib/copy";

export default function BlogPipelineStatusError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
      <ErrorState title={COPY.blogPipeline.loadError} message={error.message} onRetry={reset} />
    </div>
  );
}
