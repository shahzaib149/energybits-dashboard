"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export interface ErrorStateProps {
  title?: string;
  message: string;
  statusCode?: number;
  onRetry?: () => void;
  /** Pass true from server-component pages to show a router.refresh() button */
  showRetry?: boolean;
}

function messageForStatus(status?: number): string | null {
  if (status === 401) return "API key invalid. Check your environment settings.";
  if (status === 429) return "Airtable rate limit hit — please wait a moment and try again.";
  if (status === 408) return "Request timed out. Airtable may be slow — please try again.";
  if (status && status >= 500) return "Airtable service is temporarily unavailable. Please try again.";
  return null;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  statusCode,
  onRetry,
  showRetry
}: ErrorStateProps) {
  const router = useRouter();
  const copy = (statusCode ? messageForStatus(statusCode) : null) ?? message;
  const handleRetry = onRetry ?? (showRetry ? () => router.refresh() : undefined);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-10 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-competitor" />
      <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-textSecondary">{copy}</p>
      {handleRetry ? (
        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-background hover:bg-brandHover"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      ) : null}
    </div>
  );
}
