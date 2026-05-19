import type { SEOTrackingRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatNumber, formatPercent, formatPosition } from "@/lib/utils/format";

export function Page2Opportunities({ rows }: { rows: SEOTrackingRow[] }) {
  const copy = COPY.seoAnalytics.search.page2;
  const sorted = [...rows].sort((a, b) => b.impressions - a.impressions);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={`🎯 ${copy.title}`} subtitle={copy.subtitle} />
      {sorted.length === 0 ? (
        <p className="text-sm text-textMuted">{COPY.seoAnalytics.empty.page2}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
                <th className="py-2 pr-3">Keyword</th>
                <th className="py-2 pr-3">Position</th>
                <th className="py-2 pr-3">Impressions</th>
                <th className="py-2 pr-3">CTR</th>
                <th className="py-2">Page URL</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="py-3 pr-3 font-medium text-textPrimary">{row.query}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatPosition(row.averagePosition)}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatNumber(row.impressions)}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatPercent(row.ctrPct)}</td>
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
