import { Eye, Link2, Quote, Shield, ShieldAlert } from "lucide-react";
import type { RunOverview } from "@/lib/cairrot/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatNumber, formatPercent } from "@/lib/utils/format";

export interface CitationsResponsesCardProps {
  totals: RunOverview["totals"];
}

export function CitationsResponsesCard({ totals }: CitationsResponsesCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-6 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-textPrimary">Citations &amp; Responses</h2>
        <span className="text-xs text-textMuted" title="Aggregated from Cairrot pagehits and response mentions">
          ⓘ
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total Citations" value={formatNumber(totals.citations)} icon={Quote} />
        <MetricCard label="Unique Citation Domains" value={formatNumber(totals.uniqueDomains)} icon={Link2} />
        <MetricCard label="Responses" value={formatNumber(totals.responses)} icon={Eye} />
      </div>
      <div className="my-6 border-t border-border" />
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Neutral Share (Citations)"
          value={formatPercent(totals.neutralSharePct)}
          icon={Shield}
          hint="Citation mix"
        />
        <MetricCard
          label="Competitor Mentions (Responses)"
          value={formatNumber(totals.competitorMentions)}
          icon={ShieldAlert}
          hint="Response mentions"
        />
      </div>
    </section>
  );
}
