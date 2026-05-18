"use client";

import { AlertCircle } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message: string;
  statusCode?: number;
  onRetry?: () => void;
}

function messageForStatus(status?: number): string {
  if (status === 401) {
    return "API key invalid. Check Settings.";
  }
  if (status === 429) {
    return "Refreshing too fast. Try again in a minute.";
  }
  if (status && status >= 500) {
    return "Cairrot service unavailable. Retrying may help.";
  }
  return "Connection issue. Check your internet.";
}

export function ErrorState({ title = "Something went wrong", message, statusCode, onRetry }: ErrorStateProps) {
  const copy = statusCode ? messageForStatus(statusCode) : message;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-10 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-competitor" />
      <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-textSecondary">{copy}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-background hover:bg-brandHover"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
