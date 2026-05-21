"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ActionItem } from "@/lib/overview/action-types";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { ActionMarkHandled } from "@/components/overview-hub/ActionMarkHandled";

const channelBadge: Record<ActionItem["source"], { label: string; className: string }> = {
  seo: { label: "SEO", className: "bg-brand/20 text-brand" },
  "ga4-bounce": { label: "GA4", className: "bg-blue-500/20 text-blue-300" },
  "google-ads-waste": { label: "Ads", className: "bg-amber-500/20 text-amber-300" },
  "google-ads-roas": { label: "Ads", className: "bg-amber-500/20 text-amber-300" }
};

export function ActionCard({
  action,
  canDismiss
}: {
  action: ActionItem;
  canDismiss: boolean;
}) {
  const badge = channelBadge[action.source];

  return (
    <div className="flex flex-col gap-3 border-b border-border/60 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", badge.className)}>
            {badge.label}
          </span>
        </div>
        <p className="text-sm font-medium leading-snug text-textPrimary">{action.headline}</p>
        <p className="line-clamp-1 text-xs text-textMuted">{action.context}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-textSecondary transition hover:border-brand/40 hover:text-brand"
        >
          {COPY.overview.topActions.viewDetails}
          <ExternalLink className="h-3 w-3" />
        </Link>
        {canDismiss ? (
          <ActionMarkHandled action={action} />
        ) : null}
      </div>
    </div>
  );
}

export function TopActionsList({
  initialActions,
  canDismiss
}: {
  initialActions: ActionItem[];
  canDismiss: boolean;
}) {
  return (
    <div>
      {initialActions.map((action) => (
        <ActionCard key={action.actionKey} action={action} canDismiss={canDismiss} />
      ))}
      {initialActions.length === 0 ? (
        <p className="py-6 text-sm text-textSecondary">{COPY.overview.topActions.emptyState}</p>
      ) : null}
    </div>
  );
}
