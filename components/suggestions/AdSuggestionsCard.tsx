"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, Zap, TrendingUp, Eye, MousePointer, ShoppingCart, BarChart2,
  AlertTriangle, CheckCircle, Info, XCircle, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type {
  AdContext,
  AdSuggestion,
  GoogleAdContext,
  MetaAdContext,
  SuggestionSeverity,
  SuggestionsResponse
} from "@/lib/suggestions/types";

// ─── Funnel stage map ─────────────────────────────────────────────────────────

const FUNNEL_STAGES: Record<string, { label: string; color: string; dot: string }> = {
  "Hook Rate":       { label: "Attention",  color: "text-violet-400 bg-violet-400/10 border-violet-400/25", dot: "bg-violet-400" },
  "Hold Rate":       { label: "Retention",  color: "text-blue-400 bg-blue-400/10 border-blue-400/25",       dot: "bg-blue-400" },
  "CTR":             { label: "Click",      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",       dot: "bg-cyan-400" },
  "CPC":             { label: "Click",      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",       dot: "bg-cyan-400" },
  "Frequency":       { label: "Fatigue",    color: "text-orange-400 bg-orange-400/10 border-orange-400/25", dot: "bg-orange-400" },
  "Conversion Rate": { label: "Conversion", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25", dot: "bg-emerald-400" },
  "ROAS":            { label: "Efficiency", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25", dot: "bg-yellow-400" },
  "CPM":             { label: "Efficiency", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25", dot: "bg-yellow-400" },
  "All metrics":     { label: "Data",       color: "text-textMuted bg-surfaceElevated border-border",       dot: "bg-textMuted" },
};

function getFunnelStage(affects: string) {
  return FUNNEL_STAGES[affects] ?? {
    label: affects || "Signal",
    color: "text-textMuted bg-surfaceElevated border-border",
    dot: "bg-textMuted"
  };
}

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY: Record<SuggestionSeverity, {
  bar: string; bg: string; badge: string; label: string;
}> = {
  critical: {
    bar:   "bg-red-500",
    bg:    "bg-red-500/[0.04] hover:bg-red-500/[0.07]",
    badge: "bg-red-500/15 text-red-400 border border-red-500/25",
    label: "Critical",
  },
  warning: {
    bar:   "bg-amber-400",
    bg:    "bg-amber-400/[0.04] hover:bg-amber-400/[0.07]",
    badge: "bg-amber-400/15 text-amber-400 border border-amber-400/25",
    label: "Warning",
  },
  good: {
    bar:   "bg-green-500",
    bg:    "bg-green-500/[0.04] hover:bg-green-500/[0.07]",
    badge: "bg-green-500/15 text-green-400 border border-green-500/25",
    label: "Good",
  },
  info: {
    bar:   "bg-border",
    bg:    "bg-surface hover:bg-surfaceElevated",
    badge: "bg-surfaceElevated text-textMuted border border-border",
    label: "Info",
  }
};

// ─── Severity icon ────────────────────────────────────────────────────────────

function SevIcon({ sev }: { sev: SuggestionSeverity }) {
  const cls = "h-3.5 w-3.5 shrink-0";
  if (sev === "critical") return <XCircle className={cn(cls, "text-red-400")} />;
  if (sev === "warning")  return <AlertCircle className={cn(cls, "text-amber-400")} />;
  if (sev === "good")     return <CheckCircle className={cn(cls, "text-green-400")} />;
  return <Info className={cn(cls, "text-textMuted")} />;
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function computeScore(ctx: AdContext): number | null {
  if (ctx.platform === "meta") {
    const m = ctx as MetaAdContext;
    const toScore = (r: string): number | null => {
      const k = r?.trim().toUpperCase();
      if (!k) return null;
      if (k === "ABOVE_AVERAGE")    return 90;
      if (k === "AVERAGE")          return 60;
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
  const r = 18;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const fill = `${(pct / 100) * circ} ${circ}`;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="-rotate-90" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={fill} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <span className="absolute text-[11px] font-bold tabular-nums" style={{ color }}>{pct}</span>
    </div>
  );
}

// ─── Metric tile ──────────────────────────────────────────────────────────────

type TileStatus = "good" | "warning" | "critical" | "neutral";

const TILE_COLORS: Record<TileStatus, string> = {
  good:     "border-green-500/25 bg-green-500/8  text-green-400",
  warning:  "border-amber-400/25 bg-amber-400/8  text-amber-400",
  critical: "border-red-500/25   bg-red-500/8    text-red-400",
  neutral:  "border-border       bg-surfaceElevated text-textPrimary",
};

function MetricTile({
  icon: Icon, label, value, status = "neutral"
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  status?: TileStatus;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2", TILE_COLORS[status])}>
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-widest opacity-60 leading-none">{label}</p>
        <p className="mt-0.5 text-[12px] font-bold tabular-nums leading-none">{value}</p>
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

// ─── Main component ───────────────────────────────────────────────────────────

export function AdSuggestionsCard({
  adId, adName, platform, context, onClose, className
}: AdSuggestionsCardProps) {
  const [suggestions, setSuggestions] = useState<AdSuggestion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [cached,  setCached]          = useState(false);
  const [failed,  setFailed]          = useState(false);

  const fetchedFor   = useRef<string>("");
  const contextRef   = useRef(context);
  contextRef.current = context;

  const score   = computeScore(context);
  const metaCtx = context.platform === "meta" ? (context as MetaAdContext) : null;
  const hasAI   = !!(metaCtx?.adTranscript);

  const fetchKey = `${adId}__${hasAI ? "ai" : "no-ai"}`;

  useEffect(() => {
    if (fetchedFor.current === fetchKey) return;
    fetchedFor.current = fetchKey;

    setLoading(true); setFailed(false); setSuggestions([]);
    let cancelled = false;
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30_000);

    const body: Record<string, unknown> = { platform, adId, adContext: contextRef.current };
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

  const critCount  = suggestions.filter(s => s.severity === "critical").length;
  const warnCount  = suggestions.filter(s => s.severity === "warning").length;
  const goodCount  = suggestions.filter(s => s.severity === "good").length;

  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl",
      className
    )}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-border bg-surfaceElevated px-5 py-4">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-purple-500/5" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">

            {/* Label row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand/20">
                  <Zap className="h-3 w-3 text-brand" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-textMuted">
                  AI Suggestions
                </span>
              </div>
              {hasAI && (
                <span className="rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5
                                 text-[9px] font-semibold uppercase tracking-wide text-green-400">
                  + Video Analysis
                </span>
              )}
              {cached && !loading && (
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[9px] text-textMuted">
                  cached
                </span>
              )}
            </div>

            {/* Ad name */}
            <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-textPrimary"
               title={adName}>
              {adName}
            </p>

            {/* Summary pills */}
            {!loading && !failed && (critCount > 0 || warnCount > 0 || goodCount > 0) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {critCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20
                                   bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    {critCount} critical
                  </span>
                )}
                {warnCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20
                                   bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {warnCount} warning{warnCount > 1 ? "s" : ""}
                  </span>
                )}
                {goodCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20
                                   bg-green-500/10 px-2.5 py-1 text-[10px] font-semibold text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    {goodCount} positive
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-start gap-3">
            {score !== null && !loading && <ScoreRing score={score} />}
            <button
              type="button" onClick={onClose} aria-label="Close"
              className="mt-0.5 rounded-lg p-1.5 text-textMuted transition-colors
                         hover:bg-border/40 hover:text-textPrimary">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Key metrics strip ─────────────────────────────────────────────── */}
      {metaCtx && !loading && (
        <div className="border-b border-border bg-surface/60 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            <MetricTile
              icon={Eye} label="CTR" value={`${metaCtx.ctrPct.toFixed(2)}%`}
              status={
                metaCtx.ctrPct >= (metaCtx.accountAverageCtrPct || 0) * 1.3 ? "good" :
                metaCtx.ctrPct < 0.8 ? "critical" :
                metaCtx.ctrPct < (metaCtx.accountAverageCtrPct || 0) * 0.6 ? "warning" : "neutral"
              }
            />
            <MetricTile
              icon={BarChart2} label="Frequency" value={`${metaCtx.frequency.toFixed(1)}x`}
              status={
                metaCtx.frequency >= 5 ? "critical" :
                metaCtx.frequency >= 2.5 ? "warning" : "neutral"
              }
            />
            {metaCtx.roas > 0 && (
              <MetricTile
                icon={TrendingUp} label="ROAS" value={`${metaCtx.roas.toFixed(2)}x`}
                status={
                  metaCtx.roas < 1.0 ? "critical" :
                  metaCtx.roas < 2.0 ? "warning" :
                  metaCtx.roas >= 4.0 ? "good" : "neutral"
                }
              />
            )}
            {metaCtx.purchases > 0 && (
              <MetricTile icon={ShoppingCart} label="Purchases" value={String(metaCtx.purchases)} />
            )}
            {metaCtx.hookRate > 0 && (
              <MetricTile
                icon={MousePointer} label="Hook Rate" value={`${metaCtx.hookRate.toFixed(1)}%`}
                status={
                  metaCtx.hookRate < 20 ? "critical" :
                  metaCtx.hookRate < 25 ? "warning" :
                  metaCtx.hookRate >= 35 ? "good" : "neutral"
                }
              />
            )}
          </div>
        </div>
      )}

      {/* ── Suggestions body ──────────────────────────────────────────────── */}
      <div className="p-4">

        {/* Loading */}
        {loading && (
          <div className="space-y-2.5">
            {[0, 1, 2].map((n) => (
              <div key={n} className="flex gap-3 rounded-xl border border-border p-3.5"
                   style={{ opacity: 1 - n * 0.18 }}>
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-surfaceElevated"
                     style={{ animationDelay: `${n * 80}ms` }} />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="flex gap-2">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-surfaceElevated"
                         style={{ animationDelay: `${n * 100}ms` }} />
                    <div className="h-3 w-14 animate-pulse rounded-full bg-surfaceElevated"
                         style={{ animationDelay: `${n * 120}ms` }} />
                  </div>
                  <div className="h-2.5 w-full animate-pulse rounded bg-surfaceElevated"
                       style={{ animationDelay: `${n * 150}ms` }} />
                  <div className="h-2.5 w-3/4 animate-pulse rounded bg-surfaceElevated"
                       style={{ animationDelay: `${n * 180}ms` }} />
                </div>
              </div>
            ))}
            <p className="pt-1 text-center text-xs text-textMuted">
              {hasAI ? "Analyzing ad with video intelligence…" : "Running funnel analysis…"}
            </p>
          </div>
        )}

        {/* Error */}
        {failed && !loading && (
          <div className="rounded-xl border border-border bg-surfaceElevated p-5 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-textMuted" />
            <p className="mt-2 text-sm font-semibold text-textPrimary">Analysis unavailable</p>
            <p className="mt-1 text-xs text-textMuted">
              Suggestions couldn&apos;t be loaded right now. Your metrics are unaffected.
            </p>
          </div>
        )}

        {/* Healthy — no issues */}
        {!loading && !failed && suggestions.length === 0 && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5 text-center">
            <CheckCircle className="mx-auto h-6 w-6 text-green-400" />
            <p className="mt-2 text-sm font-semibold text-green-400">All clear</p>
            <p className="mt-1 text-xs text-textMuted">
              No issues detected — this ad is performing well across all funnel stages.
            </p>
          </div>
        )}

        {/* Suggestion cards */}
        {!loading && !failed && suggestions.length > 0 && (
          <ul className="space-y-2" role="list">
            {suggestions.map((s, i) => {
              const cfg   = SEVERITY[s.severity];
              const stage = getFunnelStage(s.affects);
              return (
                <li key={s.id} className={cn(
                  "group relative overflow-hidden rounded-xl border border-border",
                  "transition-colors duration-150",
                  cfg.bg
                )}>
                  {/* Severity bar */}
                  <div className={cn("absolute inset-y-0 left-0 w-[3px] rounded-l-xl", cfg.bar)} />

                  <div className="flex items-start gap-3 py-3.5 pl-4 pr-4">

                    {/* Priority number */}
                    <div className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center",
                      "rounded-lg text-[11px] font-bold",
                      cfg.badge
                    )}>
                      {i + 1}
                    </div>

                    <div className="min-w-0 flex-1">

                      {/* Action title */}
                      <p className="text-[13px] font-semibold leading-snug text-textPrimary">
                        {s.action}
                      </p>

                      {/* Chips */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {s.affects && (
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                            "text-[9px] font-bold uppercase tracking-wider",
                            stage.color
                          )}>
                            <span className={cn("h-1 w-1 rounded-full", stage.dot)} />
                            {stage.label}
                          </span>
                        )}
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                          "text-[9px] font-semibold",
                          cfg.badge
                        )}>
                          <SevIcon sev={s.severity} />
                          {cfg.label}
                        </span>
                        {s.source === "ai" && (
                          <span className="rounded-full border border-brand/25 bg-brand/10 px-2 py-0.5
                                           text-[9px] font-semibold text-brand">
                            AI
                          </span>
                        )}
                        {s.source === "native" && (
                          <span className="rounded-full border border-border bg-surfaceElevated px-2 py-0.5
                                           text-[9px] text-textMuted">
                            Platform
                          </span>
                        )}
                      </div>

                      {/* Metric label */}
                      {s.affects && s.affects !== "All metrics" && (
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-textMuted/60">
                          {s.affects}
                        </p>
                      )}

                      {/* Detail */}
                      <p className="mt-1.5 text-xs leading-relaxed text-textSecondary">
                        {s.detail}
                      </p>

                      {s.link && (
                        <a href={s.link} target="_blank" rel="noopener noreferrer"
                           className="mt-2 inline-flex items-center gap-1 text-xs font-medium
                                      text-brand hover:underline">
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
