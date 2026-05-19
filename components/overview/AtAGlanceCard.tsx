import type { RunOverview } from "@/lib/cairrot/types";
import { COPY } from "@/lib/copy";
import { computeAtAGlance, formatBrandMentionPct } from "@/lib/utils/overview-display";
import { formatPercent } from "@/lib/utils/format";

export interface AtAGlanceCardProps {
  run: RunOverview;
}

export function AtAGlanceCard({ run }: AtAGlanceCardProps) {
  const stats = computeAtAGlance(run);
  const copy = COPY.overview.atAGlance;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">{copy.title}</p>
      <p className="mt-2 text-lg font-semibold leading-snug text-textPrimary">
        {copy.brandMentionLead(formatBrandMentionPct(stats.brandMentionPct))}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <StatPill icon="✓" text={copy.brandInQuestions(stats.promptsWithBrand, stats.totalPrompts)} tone="positive" />
        {stats.strongestPlatform ? (
          <StatPill
            icon="✓"
            text={copy.strongestPlatform(
              stats.strongestPlatform.name,
              formatPercent(stats.strongestPlatform.citationShares.brandPct)
            )}
            tone="positive"
          />
        ) : null}
        {stats.opportunities > 0 ? (
          <StatPill icon="⚠" text={copy.opportunities(stats.opportunities)} tone="warning" />
        ) : null}
      </div>

      <p className="mt-4 text-sm text-textMuted">{copy.cta}</p>
    </section>
  );
}

function StatPill({ icon, text, tone }: { icon: string; text: string; tone: "positive" | "warning" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
        tone === "warning"
          ? "border-warning/30 bg-warning/10 text-textPrimary"
          : "border-border bg-surfaceElevated text-textSecondary"
      }`}
    >
      <span aria-hidden>{icon}</span>
      {text}
    </span>
  );
}
