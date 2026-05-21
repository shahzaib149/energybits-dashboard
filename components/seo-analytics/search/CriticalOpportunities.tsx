"use client";

import { Fragment, useState } from "react";
import type { SEOTrackingRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import type { DateRange } from "@/lib/date-range/types";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { seoCriticalColumns, seoFilename } from "@/lib/csv/columns";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ActionStatusFilterBar,
  StatusToggle,
  filterByActionStatus,
  type ActionStatusFilter
} from "@/components/seo-analytics/StatusToggle";
import { formatNumber, formatPercent, formatPosition } from "@/lib/utils/format";

function priorityVariant(priority: SEOTrackingRow["seoPriority"]) {
  if (priority === "Critical") return "default" as const;
  if (priority === "High") return "warning" as const;
  return "muted" as const;
}

export function CriticalOpportunities({
  rows,
  canEdit,
  dateRange
}: {
  rows: SEOTrackingRow[];
  canEdit: boolean;
  dateRange: DateRange;
}) {
  const copy = COPY.seoAnalytics.search.critical;
  const emptyCopy = COPY.dateRange.emptyForRange;
  const [filter, setFilter] = useState<ActionStatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const filtered = filterByActionStatus([...rows].sort((a, b) => b.impressions - a.impressions), filter);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={`🔥 ${copy.title} (${filtered.length})`}
        subtitle={copy.subtitle}
        actions={
          <CSVExportButton
            data={filtered}
            columns={seoCriticalColumns}
            filename={seoFilename("critical-seo", dateRange)}
            resourceType="seo-critical"
          />
        }
      />
      <ActionStatusFilterBar value={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <p className="text-sm text-textMuted">{emptyCopy}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
                <th className="py-2 pr-3">Keyword</th>
                <th className="py-2 pr-3">Page</th>
                <th className="py-2 pr-3">Position</th>
                <th className="py-2 pr-3">CTR</th>
                <th className="py-2 pr-3">Impressions</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">{COPY.seoAnalytics.actionStatus.label}</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-border/60">
                    <td className="py-3 pr-3 font-medium text-textPrimary">{row.query}</td>
                    <td className="max-w-[180px] truncate py-3 pr-3 text-textSecondary" title={row.pageUrl}>
                      {row.pageUrl.replace("https://energybits.com", "") || "/"}
                    </td>
                    <td className="py-3 pr-3 tabular-nums">{formatPosition(row.averagePosition)}</td>
                    <td className="py-3 pr-3 tabular-nums">{formatPercent(row.ctrPct)}</td>
                    <td className="py-3 pr-3 tabular-nums">{formatNumber(row.impressions)}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge variant={priorityVariant(row.seoPriority)}>{row.seoOpportunityType}</StatusBadge>
                    </td>
                    <td className="py-3 pr-3">
                      <StatusToggle recordId={row.id} currentStatus={row.actionStatus} canEdit={canEdit} />
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                        className="text-xs font-medium text-brand hover:text-brandHover"
                      >
                        {expandedId === row.id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === row.id ? (
                    <tr className="bg-surfaceElevated">
                      <td colSpan={8} className="px-3 py-3 text-sm text-textSecondary">
                        {row.recommendedAction}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
