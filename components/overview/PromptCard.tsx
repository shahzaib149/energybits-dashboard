import type { PromptResult } from "@/lib/cairrot/types";
import { COPY } from "@/lib/copy";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNumber } from "@/lib/utils/format";

export interface PromptCardProps {
  prompt: PromptResult;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const copy = COPY.overview.promptsGrid;

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <p className="line-clamp-2 text-sm font-semibold text-textPrimary">{prompt.text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span title={copy.citationsTooltip}>
          <StatusBadge variant="brand">{formatNumber(prompt.citationsCount)} citations</StatusBadge>
        </span>
        <span title={copy.responsesTooltip}>
          <StatusBadge variant="muted">{formatNumber(prompt.responsesCount)} responses</StatusBadge>
        </span>
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-textMuted">Citations</p>
        <ProgressBar label="Brand" percent={prompt.citationShares.brandPct} tone="brand" />
        <ProgressBar label="Competitor" percent={prompt.citationShares.competitorPct} tone="competitor" />
        <ProgressBar label="Neutral" percent={prompt.citationShares.neutralPct} tone="neutral" />
      </div>
    </article>
  );
}
