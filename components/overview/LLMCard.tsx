import { Sparkles } from "lucide-react";
import type { LLMBreakdown } from "@/lib/cairrot/types";
import { COPY } from "@/lib/copy";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNumber } from "@/lib/utils/format";

export interface LLMCardProps {
  llm: LLMBreakdown;
}

export function LLMCard({ llm }: LLMCardProps) {
  const copy = COPY.overview.llmBreakdown;

  return (
    <article className="rounded-xl border border-border bg-surfaceElevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-brand">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-textPrimary">{llm.name}</h3>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <span title={copy.citationsTooltip}>
            <StatusBadge variant="muted">{formatNumber(llm.citationsCount)} citations</StatusBadge>
          </span>
          <span title={copy.responsesTooltip}>
            <StatusBadge variant="muted">{formatNumber(llm.responsesCount)} responses</StatusBadge>
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-textMuted">Citations</p>
          <InfoTooltip content={copy.citationsSectionTooltip} label="About citations breakdown" />
        </div>
        <ProgressBar label="Brand" percent={llm.citationShares.brandPct} tone="brand" />
        <ProgressBar label="Competitor" percent={llm.citationShares.competitorPct} tone="competitor" />
        <ProgressBar label="Neutral" percent={llm.citationShares.neutralPct} tone="neutral" />
      </div>
      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-textMuted">Responses</p>
          <InfoTooltip content={copy.responsesSectionTooltip} label="About responses breakdown" />
        </div>
        <ProgressBar label="Brand only" percent={llm.responseShares.brandOnlyPct} tone="brand" />
        <ProgressBar label="Comp only" percent={llm.responseShares.competitorOnlyPct} tone="competitor" />
        <ProgressBar label="Both" percent={llm.responseShares.bothPct} tone="both" />
        <ProgressBar label="Neither" percent={llm.responseShares.neitherPct} tone="neither" />
      </div>
    </article>
  );
}
