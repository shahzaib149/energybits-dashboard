"use client";

import { useMemo } from "react";
import type { GoogleAdsCampaignRow } from "@/lib/google-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { topByRoas } from "@/lib/google-ads/metrics";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { adsFilename, campaignColumns } from "@/lib/csv/columns";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

function statusVariant(status: string) {
  if (status === "ENABLED") return "brand" as const;
  if (status === "PAUSED") return "warning" as const;
  return "muted" as const;
}

export function CampaignPerformanceTable({
  campaigns,
  dateRange
}: {
  campaigns: GoogleAdsCampaignRow[];
  dateRange: DateRange;
}) {
  const copy = COPY.googleAds.campaigns.performanceTable;
  const sorted = useMemo(() => [...campaigns].sort((a, b) => b.cost - a.cost), [campaigns]);

  const columns = useMemo(
    () => [
      {
        id: "campaign",
        header: "Campaign",
        searchValue: (row: GoogleAdsCampaignRow) => row.campaignName,
        render: (row: GoogleAdsCampaignRow) => (
          <span className="block max-w-[200px] truncate font-medium text-textPrimary" title={row.campaignName}>
            {row.campaignName}
          </span>
        )
      },
      {
        id: "status",
        header: "Status",
        searchValue: (row: GoogleAdsCampaignRow) => row.campaignStatus,
        render: (row: GoogleAdsCampaignRow) => (
          <StatusBadge variant={statusVariant(row.campaignStatus)}>{row.campaignStatus}</StatusBadge>
        )
      },
      {
        id: "type",
        header: "Type",
        searchValue: (row: GoogleAdsCampaignRow) => row.channelType,
        render: (row: GoogleAdsCampaignRow) => row.channelType.replace(/_/g, " ")
      },
      {
        id: "spend",
        header: "Spend",
        className: "tabular-nums",
        render: (row: GoogleAdsCampaignRow) => formatCurrency(row.cost)
      },
      {
        id: "clicks",
        header: "Clicks",
        className: "tabular-nums",
        render: (row: GoogleAdsCampaignRow) => formatNumber(row.clicks)
      },
      {
        id: "ctr",
        header: "CTR",
        className: "tabular-nums",
        render: (row: GoogleAdsCampaignRow) => formatPercent(row.ctrPct)
      },
      {
        id: "conv",
        header: "Conv.",
        className: "tabular-nums",
        render: (row: GoogleAdsCampaignRow) => formatNumber(row.conversions)
      },
      {
        id: "roas",
        header: "ROAS",
        className: "tabular-nums font-medium text-brand",
        render: (row: GoogleAdsCampaignRow) => formatRoas(row.roas)
      }
    ],
    []
  );

  if (sorted.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionHeaderRow title={copy.title} subtitle={copy.subtitle} />
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <CSVExportButton
            data={sorted}
            columns={campaignColumns}
            filename={adsFilename("campaigns", dateRange)}
            resourceType="google-ads-campaigns"
          />
        }
      />
      <PaginatedTable
        rows={sorted}
        columns={columns}
        getRowKey={(row) => row.id}
        searchPlaceholder="Search campaigns…"
      />
    </section>
  );
}

export function TopROASCampaigns({ campaigns }: { campaigns: GoogleAdsCampaignRow[] }) {
  const copy = COPY.googleAds.campaigns.topRoas;
  const rows = topByRoas(campaigns, 5, 5);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      {rows.length === 0 ? (
        <p className="text-sm text-textMuted">Not enough spend data to rank campaigns by ROAS yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={row.id} className="flex items-center justify-between rounded-lg border border-border bg-surfaceElevated px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-textPrimary">{row.campaignName}</p>
                  <p className="text-xs text-textMuted">{formatCurrency(row.cost)} spent · {formatNumber(row.conversions)} conv.</p>
                </div>
              </div>
              <span className="shrink-0 text-lg font-bold tabular-nums text-brand">{formatRoas(row.roas)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
