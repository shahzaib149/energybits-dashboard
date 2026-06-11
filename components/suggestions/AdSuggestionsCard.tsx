"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle, Info, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type {
  AdContext,
  AdSuggestion,
  GoogleAdContext,
  MetaAdContext,
  SuggestionSeverity,
  SuggestionsResponse
} from "@/lib/suggestions/types";

// ─── Ranking meter helpers ────────────────────────────────────────────────────

function segmentsFilled(raw: string): 0 | 1 | 2 | 3 {
  if (!raw) return 0;
  const key = raw.trim().toUpperCase();
  if (key === "ABOVE_AVERAGE") return 3;
  if (key === "AVERAGE") return 2;
  if (key.startsWith("BELOW")) return 1;
  return 0;
}

function meterSegmentClass(filled: 0 | 1 | 2 | 3, seg: number): string {
  if (seg > filled || filled === 0) return "border border-dashed border-border/40";
  if (filled === 3) return "bg-green-500";
  if (filled === 2) return "bg-amber-400";
  return "bg-red-500";
}

function rankingStateText(raw: string): string {
  if (!raw) return "No data";
  const key = raw.trim().toUpperCase();
  if (key === "ABOVE_AVERAGE") return "Above Avg";
  if (key === "AVERAGE") return "Average";
  if (key === "BELOW_AVERAGE_10") return "Bottom 10%";
  if (key === "BELOW_AVERAGE_20") return "Bottom 20%";
  if (key === "BELOW_AVERAGE_35") return "Bottom 35%";
  if (key.startsWith("BELOW")) return "Below Avg";
  if (key.startsWith("ABOVE")) return "Above Avg";
  return "No data";
}

function rankingTextColor(filled: 0 | 1 | 2 | 3): string {
  if (filled === 3) return "text-green-400";
  if (filled === 2) return "text-amber-400";
  if (filled === 1) return "text-red-400";
  return "text-textMuted";
}

// ─── Opportunity score ────────────────────────────────────────────────────────

function computeOpportunityScore(context: AdContext): number | null {
  if (context.platform === "meta") {
    const meta = context as MetaAdContext;
    const toScore = (raw: string): number | null => {
      const key = raw?.trim().toUpperCase();
      if (!key) return null;
      if (key === "ABOVE_AVERAGE") return 90;
      if (key === "AVERAGE") return 60;
      if (key === "BELOW_AVERAGE_35") return 30;
      if (key === "BELOW_AVERAGE_20") return 15;
      if (key === "BELOW_AVERAGE_10") return 5;
      return null;
    };
    const scores = [
      toScore(meta.qualityRanking),
      toScore(meta.engagementRateRanking),
      toScore(meta.conversionRateRanking)
    ].filter((s): s is number => s !== null);
    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
  }
  if (context.platform === "google") {
    const google = context as GoogleAdContext;
    return google.optimizationScore > 0 ? Math.round(google.optimizationScore) : null;
  }
  return null;
}

// ─── Severity display map ─────────────────────────────────────────────────────

type SeverityStyle = {
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  chipClass: string;
};

const SEVERITY: Record<SuggestionSeverity, SeverityStyle> = {
  critical: { borderColor: "border-l-red-500",   icon: AlertTriangle, iconColor: "text-red-400",   chipClass: "bg-red-500/15 text-red-400"    },
  warning:  { borderColor: "border-l-amber-400",  icon: AlertTriangle, iconColor: "text-amber-400", chipClass: "bg-amber-500/15 text-amber-400" },
  good:     { borderColor: "border-l-green-500",  icon: CheckCircle,   iconColor: "text-green-400", chipClass: "bg-green-500/15 text-green-400" },
  info:     { borderColor: "border-l-border",     icon: Info,          iconColor: "text-textMuted",  chipClass: "bg-surface text-textMuted"     }
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdSuggestionsCardProps {
  adId: string;
  adName: string;
  platform: "meta" | "google";
  context: AdContext;
  onClose: () => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdSuggestionsCard({
  adId,
  adName,
  platform,
  context,
  onClose,
  className
}: AdSuggestionsCardProps) {
  const [suggestions, setSuggestions] = useState<AdSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [failed, setFailed] = useState(false);
  const fetchedFor = useRef<string>("");
  const contextRef = useRef(context);
  contextRef.current = context;

  const opportunityScore = computeOpportunityScore(context);

  const metaCtx = context.platform === "meta" ? (context as MetaAdContext) : null;
  const rankings = metaCtx
    ? [
        { label: "Quality",    raw: metaCtx.qualityRanking },
        { label: "Engagement", raw: metaCtx.engagementRateRanking },
        { label: "Conversion", raw: metaCtx.conversionRateRanking }
      ]
    : [];

  useEffect(() => {
    if (fetchedFor.current === adId) return;
    fetchedFor.current = adId;

    setLoading(true);
    setFailed(false);
    setSuggestions([]);

    let cancelled = false;
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 25_000);

    fetch("/api/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform, adId, adContext: contextRef.current }),
      signal: controller.signal
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`${res.status}`);
        const data = (await res.json()) as SuggestionsResponse;
        setSuggestions(data.suggestions);
        setCached(data.cached);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setLoading(false);
      })
      .finally(() => clearTimeout(abortTimer));

    return () => {
      cancelled = true;
      fetchedFor.current = "";
      controller.abort();
      clearTimeout(abortTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adId, platform]);

  return (
    <div className={cn("rounded-xl border border-border bg-surfaceElevated overflow-hidden", className)}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 border-b border-border px-4 pb-3 pt-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 shrink-0 text-textMuted" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-textMuted">
              Suggestions
            </span>
            {cached && !loading && (
              <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-textMuted">
                cached
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm font-medium text-textPrimary" title={adName}>
            {adName}
          </p>
        </div>

        <div className="flex shrink-0 items-start gap-3">
          {opportunityScore !== null && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-textMuted">Score</p>
              <p className="tabular-nums text-sm font-semibold text-textPrimary">
                {opportunityScore}{" "}
                <span className="text-xs font-normal text-textMuted">/ 100</span>
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close suggestions"
            className="rounded p-1 text-textMuted transition-colors hover:bg-surface hover:text-textPrimary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Rating row (Meta only) ───────────────────────────────────────────── */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          {rankings.map(({ label, raw }) => {
            const filled = segmentsFilled(raw);
            return (
              <div key={label} className="flex flex-col gap-1.5 px-3 py-3">
                <span className="text-[10px] uppercase tracking-wide text-textMuted">
                  {label}
                </span>
                <div className="flex gap-0.5">
                  {([1, 2, 3] as const).map((seg) => (
                    <div
                      key={seg}
                      className={cn("h-2 flex-1 rounded-sm", meterSegmentClass(filled, seg))}
                    />
                  ))}
                </div>
                <span className={cn("text-[11px] font-medium leading-none", rankingTextColor(filled))}>
                  {rankingStateText(raw)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Suggestions ─────────────────────────────────────────────────────── */}
      <div className="p-4">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 animate-pulse rounded-lg bg-surface" />
            ))}
            <p className="pt-1 text-center text-xs text-textMuted">Analyzing ad performance…</p>
          </div>
        )}

        {/* Error */}
        {failed && !loading && (
          <p className="text-sm text-textMuted">
            Suggestions unavailable right now. Metrics are unaffected.
          </p>
        )}

        {/* Empty */}
        {!loading && !failed && suggestions.length === 0 && (
          <p className="text-sm text-textMuted">No issues found — ad looks healthy.</p>
        )}

        {/* Suggestion rows */}
        {!loading && !failed && suggestions.length > 0 && (
          <ul className="space-y-1" role="list">
            {suggestions.map((s) => {
              const style = SEVERITY[s.severity];
              const Icon = style.icon;
              return (
                <li
                  key={s.id}
                  className={cn("border-l-2 bg-surface px-3 py-2.5", style.borderColor)}
                >
                  <div className="flex items-start gap-2">
                    <Icon
                      className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", style.iconColor)}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-medium text-textPrimary">
                          {s.action}
                        </span>
                        {s.affects && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                              style.chipClass
                            )}
                          >
                            {s.affects}
                          </span>
                        )}
                        {s.source === "native" && (
                          <span className="rounded bg-surfaceElevated px-1.5 py-0.5 text-[10px] text-textMuted">
                            signal
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-textSecondary">
                        {s.detail}
                      </p>
                      {s.link && (
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-brand hover:underline"
                        >
                          View in platform →
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
