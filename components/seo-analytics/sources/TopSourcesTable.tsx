import type { GA4SourceRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { channelColor } from "@/lib/seo-analytics/metrics";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils/format";

export function TopSourcesTable({ sources }: { sources: GA4SourceRow[] }) {
  const copy = COPY.seoAnalytics.sources.topSources;
  const rows = [...sources].sort((a, b) => b.sessions - a.sessions).slice(0, 15);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
              <th className="py-2 pr-3">Source</th>
              <th className="py-2 pr-3">Medium</th>
              <th className="py-2 pr-3">Channel</th>
              <th className="py-2 pr-3">Sessions</th>
              <th className="py-2 pr-3">Engagement Rate</th>
              <th className="py-2">Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/60">
                <td className="py-3 pr-3 font-medium text-textPrimary">{row.source}</td>
                <td className="py-3 pr-3 text-textSecondary">{row.medium}</td>
                <td className="py-3 pr-3">
                  <span
                    className="inline-flex rounded-md border px-2 py-0.5 text-xs font-medium"
                    style={{
                      borderColor: `${channelColor(row.channelGroup)}40`,
                      backgroundColor: `${channelColor(row.channelGroup)}15`,
                      color: channelColor(row.channelGroup)
                    }}
                  >
                    {row.channelGroup}
                  </span>
                </td>
                <td className="py-3 pr-3 tabular-nums">{formatNumber(row.sessions)}</td>
                <td className="py-3 pr-3 tabular-nums">{formatPercent(row.engagementRatePct)}</td>
                <td className="py-3 tabular-nums">{formatDuration(row.averageSessionDuration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
