"use client";

import { useState } from "react";
import type { SEOTrackingRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import type { DateRange } from "@/lib/date-range/types";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { seoCriticalColumns, seoFilename } from "@/lib/csv/columns";
import {
  ActionStatusFilterBar,
  StatusToggle,
  filterByActionStatus,
  type ActionStatusFilter
} from "@/components/seo-analytics/StatusToggle";
import { formatNumber, formatPercent, formatPosition } from "@/lib/utils/format";

export function LowCTRTable({
  rows,
  canEdit,
  dateRange
}: {
  rows: SEOTrackingRow[];
  canEdit: boolean;
  dateRange: DateRange;
}) {
  const copy = COPY.seoAnalytics.search.lowCTR;
  const [filter, setFilter] = useState<ActionStatusFilter>("all");
  const filtered = filterByActionStatus([...rows].sort((a, b) => b.impressions - a.impressions), filter);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <CSVExportButton
            data={filtered}
            columns={seoCriticalColumns}
            filename={seoFilename("low-ctr-seo", dateRange)}
            resourceType="seo-low-ctr"
          />
        }
      />
      <ActionStatusFilterBar value={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
                <th className="py-2 pr-3">Keyword</th>
                <th className="py-2 pr-3">Position</th>
                <th className="py-2 pr-3">Impressions</th>
                <th className="py-2 pr-3">CTR</th>
                <th className="py-2 pr-3">{COPY.seoAnalytics.actionStatus.label}</th>
                <th className="py-2">Page URL</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="py-3 pr-3 font-medium text-textPrimary">{row.query}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatPosition(row.averagePosition)}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatNumber(row.impressions)}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatPercent(row.ctrPct)}</td>
                  <td className="py-3 pr-3">
                    <StatusToggle recordId={row.id} currentStatus={row.actionStatus} canEdit={canEdit} />
                  </td>
                  <td className="max-w-[220px] truncate py-3 text-textSecondary" title={row.pageUrl}>
                    {row.pageUrl.replace("https://energybits.com", "") || "/"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
