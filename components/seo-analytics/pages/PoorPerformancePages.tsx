import type { GA4PageRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils/format";

export function PoorPerformancePages({ rows }: { rows: GA4PageRow[] }) {
  const copy = COPY.seoAnalytics.pages.poorPerformance;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={`⚠️ ${copy.title}`} subtitle={copy.subtitle} />
      {rows.length === 0 ? (
        <p className="text-sm text-textMuted">{COPY.seoAnalytics.empty.poorPerformance}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
                <th className="py-2 pr-3">Page</th>
                <th className="py-2 pr-3">Sessions</th>
                <th className="py-2 pr-3">Engagement Rate</th>
                <th className="py-2 pr-3">Avg Session Duration</th>
                <th className="py-2">Bounce Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="max-w-[200px] truncate py-3 pr-3 font-medium text-textPrimary" title={row.pagePath}>
                    {row.pagePath || "/"}
                  </td>
                  <td className="py-3 pr-3 tabular-nums">{formatNumber(row.sessions)}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatPercent(row.engagementRatePct)}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatDuration(row.averageSessionDuration)}</td>
                  <td
                    className={cn(
                      "py-3 tabular-nums",
                      row.bounceRatePct > 70 ? "font-medium text-competitor" : "text-textSecondary"
                    )}
                  >
                    {formatPercent(row.bounceRatePct)} bounce
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
