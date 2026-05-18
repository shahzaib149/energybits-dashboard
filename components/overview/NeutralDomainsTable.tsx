"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { NeutralDomain } from "@/lib/cairrot/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNumber, formatPercent } from "@/lib/utils/format";

export interface NeutralDomainsTableProps {
  domains: NeutralDomain[];
}

export function NeutralDomainsTable({ domains }: NeutralDomainsTableProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? domains : domains.slice(0, 10);

  if (domains.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold text-textPrimary">Neutral domains</h2>
        <EmptyState
          title="No neutral domains"
          description="Neutral citations will appear here once Cairrot records non-brand, non-competitor sources for this run."
        />
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-4 text-sm font-semibold text-textPrimary">Neutral domains</h2>
      <div className="space-y-2">
        {visible.map((row) => (
          <div
            key={row.domain}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg border border-border/60 bg-surfaceElevated px-3 py-2 text-sm"
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(row.domain)}&sz=32`}
              alt=""
              width={20}
              height={20}
              className="rounded"
            />
            <span className="truncate font-medium text-textPrimary">{row.domain}</span>
            <span className="rounded-md bg-background px-2 py-0.5 text-xs text-textSecondary">
              {formatNumber(row.docsCount)} docs
            </span>
            <div className="flex min-w-[120px] items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-neutral" style={{ width: `${Math.min(100, row.sharePct)}%` }} />
              </div>
              <span className="w-12 text-right text-xs tabular-nums text-textSecondary">{formatPercent(row.sharePct)}</span>
              <a
                href={`https://${row.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-textMuted hover:text-brand"
                aria-label={`Open ${row.domain}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
      {domains.length > 10 ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 text-sm font-medium text-brand hover:text-brandHover"
        >
          {expanded ? "Show less" : `Show more (${domains.length - 10})`}
        </button>
      ) : null}
    </section>
  );
}
