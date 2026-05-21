"use client";

import { useEffect } from "react";
import { COPY } from "@/lib/copy";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AuditLogError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error boundary — no sensitive details logged
  }, [error]);

  return (
    <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
      <ErrorState title={COPY.auth.auditLog.loadError} message={error.message} onRetry={reset} />
    </div>
  );
}
