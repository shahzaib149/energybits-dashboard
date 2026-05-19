import type { AIReadinessScore } from "@/lib/cairrot/types";
import { COPY } from "@/lib/copy";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ProgressBar } from "@/components/ui/ProgressBar";

export interface GeoReadinessPanelProps {
  geo: AIReadinessScore;
}

export function GeoReadinessPanel({ geo }: GeoReadinessPanelProps) {
  const copy = COPY.overview.geo;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-sky-400">{copy.eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold text-textPrimary">{copy.title}</h2>
      <p className="mt-1 text-sm text-textSecondary">{copy.subtitle}</p>
      <div className="mt-6 flex items-end gap-4">
        <p className="text-5xl font-bold tabular-nums text-textPrimary">{geo.overallScore}</p>
        <p className="pb-2 text-sm text-textMuted">/ 100 overall</p>
      </div>
      <p className="mt-1 text-xs text-textMuted">Updated {new Date(geo.lastUpdated).toLocaleString()}</p>
      <div className="mt-6 space-y-3">
        {geo.categories.map((category) => (
          <div key={category.name} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <ProgressBar label={category.name} percent={category.score} tone="neutral" />
            </div>
            {copy.categories[category.name] ? (
              <InfoTooltip content={copy.categories[category.name]} label={`About ${category.name}`} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
