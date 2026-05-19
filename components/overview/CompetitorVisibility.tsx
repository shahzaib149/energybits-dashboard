import type { CompetitorData } from "@/lib/cairrot/types";
import { COPY } from "@/lib/copy";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatPercent } from "@/lib/utils/format";

export interface CompetitorVisibilityProps {
  competitors: CompetitorData[];
}

export function CompetitorVisibility({ competitors }: CompetitorVisibilityProps) {
  const copy = COPY.overview.competitors;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      {competitors.length === 0 ? (
        <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
      ) : (
        <>
          <div className="space-y-3">
            {competitors.map((row) => (
              <div key={row.name} className="rounded-lg border border-border/60 bg-surfaceElevated p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-textPrimary">{row.name}</h3>
                  <span className="text-xs text-textSecondary">
                    {formatPercent(row.citationSharePct)} share of cited sources
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-competitor" style={{ width: `${Math.min(100, row.citationSharePct)}%` }} />
                </div>
                <p className="mt-2 text-xs text-textMuted">
                  {copy.responseShare}: {formatPercent(row.responseSharePct)}
                </p>
              </div>
            ))}
          </div>
          {competitors.length === 1 ? (
            <p className="mt-4 text-sm text-textMuted">{copy.singleHelper(competitors[0].name)}</p>
          ) : null}
        </>
      )}
    </section>
  );
}
