import type { RunOverview } from "@/lib/cairrot/types";
import { Eye, Link2, Quote, Shield, ShieldAlert } from "lucide-react";
import { COPY } from "@/lib/copy";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatNumber, formatPercent } from "@/lib/utils/format";

export interface CitationsResponsesCardProps {
  totals: RunOverview["totals"];
}

export function CitationsResponsesCard({ totals }: CitationsResponsesCardProps) {
  const copy = COPY.overview.citationsResponses;
  const metrics = copy.metrics;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} tooltip={copy.tooltip} className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label={metrics.totalCitations.label}
          value={formatNumber(totals.citations)}
          icon={Quote}
          description={metrics.totalCitations.description}
        />
        <MetricCard
          label={metrics.uniqueDomains.label}
          value={formatNumber(totals.uniqueDomains)}
          icon={Link2}
          description={metrics.uniqueDomains.description}
        />
        <MetricCard
          label={metrics.responses.label}
          value={formatNumber(totals.responses)}
          icon={Eye}
          description={metrics.responses.description}
        />
      </div>
      <div className="my-6 border-t border-border" />
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label={metrics.neutralShare.label}
          value={formatPercent(totals.neutralSharePct)}
          icon={Shield}
          description={metrics.neutralShare.description}
        />
        <MetricCard
          label={metrics.competitorMentions.label}
          value={formatNumber(totals.competitorMentions)}
          icon={ShieldAlert}
          description={metrics.competitorMentions.description}
        />
      </div>
    </section>
  );
}
