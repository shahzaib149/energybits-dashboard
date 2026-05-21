"use client";

import { useMemo } from "react";
import type { CriteoDailyRow } from "@/lib/criteo-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { criteoDailyColumns, criteoFilename } from "@/lib/csv/columns";
import { formatCurrency, formatDate, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

export function DailyTab({ daily, dateRange }: { daily: CriteoDailyRow[]; dateRange: DateRange }) {
  const copy = COPY.criteoAds.daily;
  const sorted = useMemo(
    () => [...daily].sort((a, b) => b.day.localeCompare(a.day) || b.advertiserCost - a.advertiserCost),
    [daily]
  );

  const columns = useMemo(
    () => [
      {
        id: "day",
        header: "Day",
        className: "tabular-nums text-textSecondary",
        render: (row: CriteoDailyRow) => formatDate(row.day)
      },
      {
        id: "campaign",
        header: "Campaign",
        searchValue: (row: CriteoDailyRow) => row.campaignName,
        render: (row: CriteoDailyRow) => (
          <span className="block max-w-[160px] truncate font-medium text-textPrimary" title={row.campaignName}>
            {row.campaignName}
          </span>
        )
      },
      {
        id: "ad",
        header: "Ad",
        searchValue: (row: CriteoDailyRow) => row.ad,
        render: (row: CriteoDailyRow) => (
          <span className="block max-w-[160px] truncate text-textSecondary" title={row.ad}>
            {row.ad}
          </span>
        )
      },
      {
        id: "spend",
        header: "Spend",
        className: "tabular-nums",
        render: (row: CriteoDailyRow) => formatCurrency(row.advertiserCost)
      },
      {
        id: "clicks",
        header: "Clicks",
        className: "tabular-nums",
        render: (row: CriteoDailyRow) => formatNumber(row.clicks)
      },
      {
        id: "displays",
        header: "Displays",
        className: "tabular-nums",
        render: (row: CriteoDailyRow) => formatNumber(row.displays)
      },
      {
        id: "ctr",
        header: "CTR",
        className: "tabular-nums",
        render: (row: CriteoDailyRow) => formatPercent(row.ctrPct)
      },
      {
        id: "cpc",
        header: "CPC",
        className: "tabular-nums",
        render: (row: CriteoDailyRow) => formatCurrency(row.cpc)
      },
      {
        id: "sales",
        header: "Sales",
        className: "tabular-nums",
        render: (row: CriteoDailyRow) => formatCurrency(row.salesAllClientAttribution)
      },
      {
        id: "roas",
        header: "ROAS",
        className: "tabular-nums font-medium text-brand",
        render: (row: CriteoDailyRow) => formatRoas(row.roasAllClientAttribution)
      }
    ],
    []
  );

  if (sorted.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={copy.performanceTable.title}
        subtitle={copy.performanceTable.subtitle}
        actions={
          <CSVExportButton
            data={sorted}
            columns={criteoDailyColumns}
            filename={criteoFilename("criteo-daily", dateRange)}
            resourceType="criteo-ads-daily"
          />
        }
      />
      <PaginatedTable
        rows={sorted}
        columns={columns}
        getRowKey={(row) => row.id}
        searchPlaceholder="Search by campaign or ad…"
      />
    </section>
  );
}
