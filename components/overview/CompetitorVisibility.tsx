import type { CompetitorData } from "@/lib/cairrot/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPercent } from "@/lib/utils/format";

export interface CompetitorVisibilityProps {
  competitors: CompetitorData[];
}

export function CompetitorVisibility({ competitors }: CompetitorVisibilityProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-4 text-sm font-semibold text-textPrimary">Competitor visibility</h2>
      {competitors.length === 0 ? (
        <EmptyState
          title="No competitor citations yet"
          description="Configure competitors in Cairrot and re-run visibility checks to see share metrics here."
          actionLabel="Cairrot project settings"
          actionHref="https://cairrot.com"
        />
      ) : (
        <div className="space-y-3">
          {competitors.map((row) => (
            <div key={row.name} className="rounded-lg border border-border/60 bg-surfaceElevated p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-textPrimary">{row.name}</h3>
                <span className="text-xs text-textSecondary">{formatPercent(row.citationSharePct)} citation share</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-competitor" style={{ width: `${Math.min(100, row.citationSharePct)}%` }} />
              </div>
              <p className="mt-2 text-xs text-textMuted">Response share: {formatPercent(row.responseSharePct)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
