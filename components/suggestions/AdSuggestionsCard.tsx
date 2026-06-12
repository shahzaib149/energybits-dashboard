"use client";

import { useEffect, useRef, useState } from "react";
import { X, Zap, TrendingUp, Eye, MousePointer, ShoppingCart, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type {
  AdContext,
  AdSuggestion,
  GoogleAdContext,
  MetaAdContext,
  SuggestionSeverity,
  SuggestionsResponse
} from "@/lib/suggestions/types";

// ─── Funnel stage chip ────────────────────────────────────────────────────────

const FUNNEL_STAGES: Record<string, { label: string; color: string }> = {
  "Hook Rate":          { label: "Attention",  color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  "Hold Rate":          { label: "Retention",  color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  "CTR":                { label: "Click",      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  "CPC":                { label: "Click",      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  "Frequency":          { label: "Fatigue",    color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  "Conversion Rate":    { label: "Conversion", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  "ROAS":               { label: "Efficiency", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  "CPM":                { label: "Efficiency", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  "Quality Ranking":    { label: "Signal",     color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
  "Engagement Ranking": { label: "Signal",     color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
  "Conversion Ranking": { label: "Signal",     color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
};

function getFunnelStage(affects: string) {
  return FUNNEL_STAGES[affects] ?? { label: "Signal", color: "text-textMuted bg-surfaceElevated border-border" };
}

// ─── Severity config ──────────────────────────────────────────────────────────

type SeverityConfig = {
  bar: string;
  bg: string;
  badge: string;
  icon: string;
  dot: string;
  label: string;
};

const SEVERITY_CONFIG: Record<SuggestionSeverity, SeverityConfig> = {
  critical: {
    bar:   "bg-red-500",
    bg:    "bg-red-500/5 hover:bg-red-500/8",
    badge: "bg-red-500/15 text-red-400 border border-red-500/20",
    icon:  "text-red-400",
    dot:   "bg-red-500",
    label: "Critical"
  },
  warning: {
    bar:   "bg-amber-400",
    bg:    "bg-amber-400/5 hover:bg-amber-400/8",
    badge: "bg-amber-400/15 text-amber-400 border border-amber-400/20",
    icon:  "text-amber-400",
    dot:   "bg-amber-400",
    label: "Warning"
  },
  good: {
    bar:   "bg-green-500",
    bg:    "bg-green-500/5 hover:bg-green-500/8",
    badge: "bg-green-500/15 text-green-400 border border-green-500/20",
    icon:  "text-green-400",
    dot:   "bg-green-500",
    label: "Good"
  },
  info: {
    bar:   "bg-border",
    bg:    "bg-surface hover:bg-surfaceElevated",
    badge: "bg-surface text-textMuted border border-border",
    icon:  "text-textMuted",
    dot:   "bg-textMuted",
    label: "Info"
  }
};

// ─── Ranking meter (Meta) ─────────────────────────────────────────────────────

function segmentsFilled(raw: string): 0 | 1 | 2 | 3 {
  if (!raw) return 0;
  const k = raw.trim().toUpperCase();
  if (k === "ABOVE_AVERAGE") return 3;
  if (k === "AVERAGE") return 2;
  if (k.startsWith("BELOW")) return 1;
  return 0;
}

function rankingLabel(raw: string): string {
  if (!raw) return "No data";
  const k = raw.trim().toUpperCase();
  if (k === "ABOVE_AVERAGE") return "Above Avg";
  if (k === "AVERAGE") return "Average";
  if (k === "BELOW_AVERAGE_10") return "Bottom 10%";
  if (k === "BELOW_AVERAGE_20") return "Bottom 20%";
  if (k === "BELOW_AVERAGE_35") return "Bottom 35%";
  if (k.startsWith("BELOW")) return "Below Avg";
  if (k.startsWith("ABOVE")) return "Above Avg";
  return "No data";
}

function rankingColor(filled: 0 | 1 | 2 | 3) {
  if (filled === 3) return "text-green-400";
  if (filled === 2) return "text-amber-400";
  if (filled === 1) return "text-red-400";
  return "text-textMuted";
}

function segmentColor(filled: 0 | 1 | 2 | 3, seg: number): string {
  if (seg > filled || filled === 0) return "border border-dashed border-border/40 bg-transparent";
  if (filled === 3) return "bg-green-500";
  if (filled === 2) return "bg-amber-400";
  return "bg-red-500";
}

// ─── Opportunity score ────────────────────────────────────────────────────────

function computeScore(ctx: AdContext): number | null {
  if (ctx.platform === "meta") {
    const m = ctx as MetaAdContext;
    const toScore = (r: string): number | null => {
      const k = r?.trim().toUpperCase();
      if (!k) return null;
      if (k === "ABOVE_AVERAGE") return 90;
      if (k === "AVERAGE") return 60;
      if (k === "BELOW_AVERAGE_35") return 30;
      if (k === "BELOW_AVERAGE_20") return 15;
      if (k === "BELOW_AVERAGE_10") return 5;
      return null;
    };
    const scores = [m.qualityRanking, m.engagementRateRanking, m.conversionRateRanking]
      .map(toScore).filter((s): s is number => s !== null);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : null;
  }
  if (ctx.platform === "google") {
    const g = ctx as GoogleAdContext;
    return g.optimizationScore > 0 ? Math.round(g.optimizationScore) : null;
  }
  return null;
}

function ScoreRing({ score }: { score: number }) {
  const r = 18; const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dashArr = `${(pct / 100) * circ} ${circ}`;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="-rotate-90" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={dashArr} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <span className="absolute text-[11px] font-bold tabular-nums" style={{ color }}>{pct}</span>
    </div>
  );
}

// ─── Metric pill ──────────────────────────────────────────────────────────────

function MetaPill({ icon: Icon, label, value, highlight }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5",
      highlight ? "border-brand/30 bg-brand/10" : "border-border bg-surfaceElevated")}>
      <Icon className={cn("h-3 w-3 shrink-0", highlight ? "text-brand" : "text-textMuted")} />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide text-textMuted">{label}</p>
        <p className={cn("text-[11px] font-semibold tabular-nums", highlight ? "text-brand" : "text-textPrimary")}>{value}</p>
      </div>
    </div>
  );
}

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

export function AdSuggestionsCard({ adId, adName, platform, context, onClose, className }: AdSuggestionsCardProps) {
  const [suggestions, setSuggestions] = useState<AdSuggestion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [cached, setCached]           = useState(false);
  const [failed, setFailed]           = useState(false);
  const fetchedFor   = useRef<string>("");
  const contextRef   = useRef(context);
  contextRef.current = context;

  const score    = computeScore(context);
  const metaCtx  = context.platform === "meta" ? (context as MetaAdContext) : null;
  const hasAI    = !!(metaCtx as MetaAdContext | null)?.adTranscript;

  const rankings = metaCtx ? [
    { label: "Quality",    raw: metaCtx.qualityRanking },
    { label: "Engagement", raw: metaCtx.engagementRateRanking },
    { label: "Conversion", raw: metaCtx.conversionRateRanking },
  ] : [];

  // Re-fetch when adId changes OR when transcript becomes available
  const transcriptKey = hasAI ? "with-ai" : "no-ai";
  const fetchKey = `${adId}__${transcriptKey}`;

  useEffect(() => {
    if (fetchedFor.current === fetchKey) return;
    fetchedFor.current = fetchKey;

    setLoading(true); setFailed(false); setSuggestions([]);
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30_000);

    const body: Record<string, unknown> = {
      platform, adId, adContext: contextRef.current
    };
    const transcript = (contextRef.current as MetaAdContext).adTranscript;
    if (transcript) body.adTranscript = transcript;

    fetch("/api/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`${res.status}`);
        const data = (await res.json()) as SuggestionsResponse;
        setSuggestions(data.suggestions);
        setCached(data.cached);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setFailed(true); setLoading(false); } })
      .finally(() => clearTimeout(timer));

    return () => { cancelled = true; fetchedFor.current = ""; ctrl.abort(); clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adId, platform, fetchKey]);

  const criticalCount = suggestions.filter((s) => s.severity === "critical").length;
  const warningCount  = suggestions.filter((s) => s.severity === "warning").length;

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface shadow-xl", className)}>

      {/* ── Header ── */}
      <div className="relative overflow-hidden border-b border-border bg-surfaceElevated px-5 py-4">
        {/* Subtle gradient accent */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-transparent" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-brand" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-textMuted">AI Suggestions</span>
              </div>
              {hasAI && (
                <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-green-400">
                  + Video Analysis
                </span>
              )}
              {cached && !loading && (
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[9px] text-textMuted">
                  cached
                </span>
              )}
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-textPrimary" title={adName}>{adName}</p>
            {!loading && !failed && (criticalCount > 0 || warningCount > 0) && (
              <p className="mt-0.5 text-xs text-textMuted">
                {criticalCount > 0 && <span className="text-red-400">{criticalCount} critical</span>}
                {criticalCount > 0 && warningCount > 0 && <span className="text-textMuted"> · </span>}
                {warningCount > 0 && <span className="text-amber-400">{warningCount} warning{warningCount > 1 ? "s" : ""}</span>}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-start gap-3">
            {score !== null && !loading && <ScoreRing score={score} />}
            <button type="button" onClick={onClose} aria-label="Close suggestions"
              className="mt-0.5 rounded-lg p-1.5 text-textMuted transition-colors hover:bg-surface hover:text-textPrimary">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Meta stats strip ── */}
      {metaCtx && !loading && (
        <div className="border-b border-border bg-surfaceElevated/50 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            <MetaPill icon={Eye}          label="CTR"       value={`${metaCtx.ctrPct.toFixed(2)}%`}   highlight={metaCtx.ctrPct >= metaCtx.accountAverageCtrPct * 1.1} />
            <MetaPill icon={BarChart2}    label="Frequency" value={`${metaCtx.frequency.toFixed(1)}x`} highlight={metaCtx.frequency >= 2.5} />
            {metaCtx.roas > 0 && (
              <MetaPill icon={TrendingUp} label="ROAS"      value={`${metaCtx.roas.toFixed(2)}x`}     highlight={metaCtx.roas >= 2} />
            )}
            {metaCtx.purchases > 0 && (
              <MetaPill icon={ShoppingCart} label="Purchases" value={String(metaCtx.purchases)} />
            )}
            {metaCtx.hookRate > 0 && (
              <MetaPill icon={MousePointer} label="Hook Rate" value={`${metaCtx.hookRate.toFixed(1)}%`} highlight={metaCtx.hookRate < 20} />
            )}
          </div>
        </div>
      )}

      {/* ── Rankings row (Meta) ── */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          {rankings.map(({ label, raw }) => {
            const f = segmentsFilled(raw);
            return (
              <div key={label} className="flex flex-col gap-2 px-4 py-3">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-textMuted">{label}</span>
                <div className="flex gap-1">
                  {([1, 2, 3] as const).map((seg) => (
                    <div key={seg} className={cn("h-1.5 flex-1 rounded-full", segmentColor(f, seg))} />
                  ))}
                </div>
                <span className={cn("text-[11px] font-semibold leading-none", rankingColor(f))}>
                  {rankingLabel(raw)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Suggestions ── */}
      <div className="p-4">

        {/* Loading */}
        {loading && (
          <div className="space-y-2.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex gap-3 rounded-xl border border-border p-3.5">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-surfaceElevated" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-surfaceElevated" style={{ animationDelay: `${n * 100}ms` }} />
                  <div className="h-2.5 w-full animate-pulse rounded bg-surfaceElevated" style={{ animationDelay: `${n * 150}ms` }} />
                </div>
              </div>
            ))}
            <p className="pt-1 text-center text-xs text-textMuted">
              {hasAI ? "Analyzing ad with video intelligence…" : "Analyzing ad performance…"}
            </p>
          </div>
        )}

        {/* Error */}
        {failed && !loading && (
          <div className="rounded-xl border border-border bg-surfaceElevated p-4 text-center">
            <p className="text-sm text-textMuted">Suggestions unavailable right now. Metrics are unaffected.</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !failed && suggestions.length === 0 && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
            <p className="text-sm font-medium text-green-400">No issues found — this ad looks healthy.</p>
          </div>
        )}

        {/* Suggestion cards */}
        {!loading && !failed && suggestions.length > 0 && (
          <ul className="space-y-2" role="list">
            {suggestions.map((s, i) => {
              const cfg    = SEVERITY_CONFIG[s.severity];
              const stage  = getFunnelStage(s.affects);
              return (
                <li key={s.id} className={cn(
                  "group relative overflow-hidden rounded-xl border border-border transition-colors",
                  cfg.bg
                )}>
                  {/* Priority number + severity bar */}
                  <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-xl", cfg.bar)} />
                  <div className="flex items-start gap-3 pl-4 pr-3 py-3.5">
                    {/* Priority badge */}
                    <div className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                      cfg.badge
                    )}>
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Action + chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-textPrimary">{s.action}</span>
                        {s.affects && (
                          <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide", stage.color)}>
                            {stage.label}
                          </span>
                        )}
                        <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-medium", cfg.badge)}>
                          {cfg.label}
                        </span>
                        {s.source === "native" && (
                          <span className="rounded-full border border-border bg-surfaceElevated px-2 py-0.5 text-[9px] text-textMuted">
                            Platform signal
                          </span>
                        )}
                        {s.source === "ai" && (
                          <span className="rounded-full border border-brand/20 bg-brand/10 px-2 py-0.5 text-[9px] text-brand">
                            AI
                          </span>
                        )}
                      </div>
                      {/* Affects label */}
                      {s.affects && (
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-textMuted">{s.affects}</p>
                      )}
                      {/* Detail */}
                      <p className="mt-1 text-xs leading-relaxed text-textSecondary">{s.detail}</p>
                      {s.link && (
                        <a href={s.link} target="_blank" rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-xs text-brand hover:underline">
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
