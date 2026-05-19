import type { GoogleAdsCampaignRow } from "@/lib/google-ads/types";
import { COPY } from "@/lib/copy";
import { topByRoas } from "@/lib/google-ads/metrics";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils/format";

function statusVariant(status: string) {
  if (status === "ENABLED") return "brand" as const;
  if (status === "PAUSED") return "warning" as const;
  return "muted" as const;
}

export function CampaignPerformanceTable({ campaigns }: { campaigns: GoogleAdsCampaignRow[] }) {
  const copy = COPY.googleAds.campaigns.performanceTable;
  const sorted = [...campaigns].sort((a, b) => b.cost - a.cost);

  if (sorted.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionTitle title={copy.title} subtitle={copy.subtitle} />
        <p className="text-sm text-textMuted">{COPY.googleAds.empty.campaigns}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
              <th className="py-2 pr-3">Campaign</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Spend</th>
              <th className="py-2 pr-3">Clicks</th>
              <th className="py-2 pr-3">CTR</th>
              <th className="py-2 pr-3">Conv.</th>
              <th className="py-2">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className="border-b border-border/60">
                <td className="max-w-[200px] truncate py-3 pr-3 font-medium text-textPrimary" title={row.campaignName}>
                  {row.campaignName}
                </td>
                <td className="py-3 pr-3">
                  <StatusBadge variant={statusVariant(row.campaignStatus)}>{row.campaignStatus}</StatusBadge>
                </td>
                <td className="py-3 pr-3 text-textSecondary">{row.channelType.replace(/_/g, " ")}</td>
                <td className="py-3 pr-3 tabular-nums">{formatCurrency(row.cost)}</td>
                <td className="py-3 pr-3 tabular-nums">{formatNumber(row.clicks)}</td>
                <td className="py-3 pr-3 tabular-nums">{formatPercent(row.ctrPct)}</td>
                <td className="py-3 pr-3 tabular-nums">{formatNumber(row.conversions)}</td>
                <td className="py-3 tabular-nums font-medium text-brand">{formatRoas(row.roas)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
