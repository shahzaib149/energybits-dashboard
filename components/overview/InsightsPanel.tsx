import { Target, TrendingDown, TrendingUp } from "lucide-react";
import type { Insight } from "@/lib/cairrot/types";
import { COPY, sanitizeOverviewText } from "@/lib/copy";
import { BrandVariantsBadges } from "@/components/overview/BrandVariantsBadges";
import { cn } from "@/lib/utils/cn";

export interface InsightsPanelProps {
  insights: Insight[];
  recommendedActions: string[];
  brandVariants: string[];
}

const priorityStyles = {
  High: "border-competitor/40 bg-competitor/10 text-competitor",
  Medium: "border-warning/40 bg-warning/10 text-warning",
  Low: "border-neutral/40 bg-neutral/10 text-neutral"
};

function InsightIcon({ type }: { type: Insight["type"] }) {
  if (type === "weakest") {
    return <TrendingDown className="h-4 w-4 shrink-0 text-warning" />;
  }
  if (type === "top_prompt") {
    return <Target className="h-4 w-4 shrink-0 text-brand" />;
  }
  return <TrendingUp className="h-4 w-4 shrink-0 text-brand" />;
}

export function InsightsPanel({ insights, recommendedActions, brandVariants }: InsightsPanelProps) {
  const copy = COPY.overview.insights;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brand" />
        <h2 className="text-sm font-semibold text-textPrimary">{copy.title}</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ul className="space-y-3">
          {insights.map((insight) => (
            <li key={insight.text} className="flex gap-3 rounded-lg border border-border/60 bg-surfaceElevated p-3">
              <InsightIcon type={insight.type} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-textPrimary">{sanitizeOverviewText(insight.text)}</p>
                  {insight.priority ? (
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase",
                        priorityStyles[insight.priority]
                      )}
                    >
                      {insight.priority}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-textMuted">{copy.recommendedActions}</h3>
          <ol className="mt-3 space-y-2">
            {recommendedActions.map((action, index) => (
              <li key={action} className="flex gap-2 text-sm text-textSecondary">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-background">
                  {index + 1}
                </span>
                <span>{sanitizeOverviewText(action)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-6 border-t border-border pt-4">
        <BrandVariantsBadges variants={brandVariants} />
      </div>
    </section>
  );
}
