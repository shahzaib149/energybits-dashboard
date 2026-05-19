import type { GoogleAdsCampaignRow } from "@/lib/google-ads/types";
import { COPY } from "@/lib/copy";
import { avgImpressionShare } from "@/lib/google-ads/metrics";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatPercent } from "@/lib/utils/format";

export function ImpressionSharePanel({ campaigns }: { campaigns: GoogleAdsCampaignRow[] }) {
  const copy = COPY.googleAds.campaigns.impressionShare;
  const share = avgImpressionShare(campaigns);

  const items = [
    {
      label: "Search impression share",
      value: share.searchShare,
      color: "bg-blue-500",
      tooltip: "Percentage of eligible search impressions your ads actually received."
    },
    {
      label: "Lost to budget",
      value: share.budgetLost,
      color: "bg-amber-500",
      tooltip: "Impressions missed because your daily budget ran out."
    },
    {
      label: "Lost to ad rank",
      value: share.rankLost,
      color: "bg-red-500",
      tooltip: "Impressions missed because your bid or quality score wasn't high enough."
    }
  ];

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-surfaceElevated p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-textMuted">{item.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-textPrimary">
              {formatPercent(item.value <= 1 ? item.value * 100 : item.value)}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${Math.min(item.value <= 1 ? item.value * 100 : item.value, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-textMuted">{item.tooltip}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
