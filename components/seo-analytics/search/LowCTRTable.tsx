"use client";

import { useMemo, useState } from "react";
import type { SEOTrackingRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import type { DateRange } from "@/lib/date-range/types";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
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
  const filtered = useMemo(
    () => filterByActionStatus([...rows].sort((a, b) => b.impressions - a.impressions), filter),
    [rows, filter]
  );

  const columns = useMemo(
    () => [
      {
        id: "keyword",
        header: "Keyword",
        searchValue: (row: SEOTrackingRow) => row.query,
        className: "font-medium text-textPrimary",
        render: (row: SEOTrackingRow) => row.query
      },
      {
        id: "position",
        header: "Position",
        className: "tabular-nums",
        render: (row: SEOTrackingRow) => formatPosition(row.averagePosition)
      },
      {
        id: "impressions",
        header: "Impressions",
        className: "tabular-nums",
        render: (row: SEOTrackingRow) => formatNumber(row.impressions)
      },
      {
        id: "ctr",
        header: "CTR",
        className: "tabular-nums",
        render: (row: SEOTrackingRow) => formatPercent(row.ctrPct)
      },
      {
        id: "status",
        header: COPY.seoAnalytics.actionStatus.label,
        render: (row: SEOTrackingRow) => (
          <StatusToggle recordId={row.id} currentStatus={row.actionStatus} canEdit={canEdit} />
        )
      },
      {
        id: "url",
        header: "Page URL",
        searchValue: (row: SEOTrackingRow) => row.pageUrl,
        render: (row: SEOTrackingRow) => (
          <span className="block max-w-[220px] truncate text-textSecondary" title={row.pageUrl}>
            {row.pageUrl.replace("https://energybits.com", "") || "/"}
          </span>
        )
      }
    ],
    [canEdit]
  );

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
        <PaginatedTable
          rows={filtered}
          columns={columns}
          getRowKey={(row) => row.id}
          searchPlaceholder="Search keywords or URLs…"
          className="mt-4"
        />
      )}
    </section>
  );
}
