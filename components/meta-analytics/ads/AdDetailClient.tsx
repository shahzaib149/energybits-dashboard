"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  AreaChart, Area, BarChart, Bar,
  CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  ArrowLeft, ExternalLink, MousePointer, Eye,
  DollarSign, TrendingUp, Users, BarChart2
} from "lucide-react";
import type { MetaAdInsightRow } from "@/lib/meta-analytics/types";
import type { MetaAdContext } from "@/lib/suggestions/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { AdSuggestionsCard } from "@/components/suggestions/AdSuggestionsCard";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";

// ─── Ad embed helpers ─────────────────────────────────────────────────────────

function getAdPlatform(url: string): "instagram" | "facebook" | "other" {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com")) return "facebook";
  return "other";
}

function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    const win = window as Window & { instgrm?: { Embeds: { process: () => void } } };
    if (win.instgrm?.Embeds) win.instgrm.Embeds.process();
  }, [url]);

  return (
    <>
      {/* Dark phone-frame wrapper */}
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-border bg-[#000] shadow-lg">
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#111] px-4 py-2.5">
          <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span className="text-xs font-medium text-white/70">Instagram</span>
        </div>
        <div className="bg-white">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            data-instgrm-captioned
            style={{ margin: 0, maxWidth: "100%", width: "100%" }}
          />
        </div>
      </div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          const win = window as Window & { instgrm?: { Embeds: { process: () => void } } };
          win.instgrm?.Embeds.process();
        }}
      />
    </>
  );
}

function FacebookEmbed({ url }: { url: string }) {
  const src =
    `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}` +
    `&show_text=false&width=500&lazy=true`;
  return (
    <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-border bg-[#000] shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#111] px-4 py-2.5">
        <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span className="text-xs font-medium text-white/70">Facebook</span>
      </div>
      <div className="bg-white">
        <iframe
          src={src}
          width="500"
          height="500"
          style={{ border: "none", display: "block", width: "100%" }}
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title="Facebook ad preview"
        />
      </div>
    </div>
  );
}

// ─── Chart theme ──────────────────────────────────────────────────────────────

const SURFACE = "#1e1e2e";
const GRID_COLOR = "#2a2a3a";

const axisProps = {
  tick: { fill: "#6b7280", fontSize: 11 },
  axisLine: { stroke: GRID_COLOR },
  tickLine: false as const
};

// ─── Data helpers ─────────────────────────────────────────────────────────────

/** Remove Make.com re-sync duplicates — one record per calendar day. */
function deduplicateByDate(rows: MetaAdInsightRow[]): MetaAdInsightRow[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (!row.dateStart || seen.has(row.dateStart)) return false;
    seen.add(row.dateStart);
    return true;
  });
}

function aggregateRows(rows: MetaAdInsightRow[]) {
  const clicks      = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const reach       = rows.reduce((s, r) => s + r.reach, 0);
  const spend       = rows.reduce((s, r) => s + r.spend, 0);
  const ctrPct      = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc         = clicks > 0      ? spend / clicks              : 0;
  const cpm         = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const frequency   = reach > 0       ? impressions / reach         : 0;
  return { clicks, impressions, reach, spend, ctrPct, cpc, cpm, frequency };
}

function buildContext(
  adName: string,
  rows: MetaAdInsightRow[],
  agg: ReturnType<typeof aggregateRows>
): MetaAdContext {
  const first = rows[0];
  return {
    platform: "meta",
    adId: first?.adId || adName,
    adName,
    spend: agg.spend,
    impressions: agg.impressions,
    clicks: agg.clicks,
    reach: agg.reach,
    ctrPct: agg.ctrPct,
    cpc: agg.cpc,
    cpm: agg.cpm,
    frequency: agg.frequency,
    recordCount: rows.length,
    qualityRanking: first?.qualityRanking ?? "",
    engagementRateRanking: first?.engagementRateRanking ?? "",
    conversionRateRanking: first?.conversionRateRanking ?? "",
    adLink: first?.adLink ?? "",
    accountAverageCtrPct: agg.ctrPct,
    accountAverageCpc: agg.cpc,
    accountAverageFrequency: agg.frequency
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdDetailClient({
  adName,
  rows
}: {
  adName: string;
  rows: MetaAdInsightRow[];
}) {
  // Deduplicate first — removes Make.com double-sync rows
  const deduped = deduplicateByDate(rows);
  const agg     = aggregateRows(deduped);
  const context = buildContext(adName, deduped, agg);
  const adLink  = deduped[0]?.adLink ?? "";

  const [showSuggestions, setShowSuggestions] = useState(true);

  if (deduped.length === 0) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <Link href="/meta-analytics?tab=ads" className="inline-flex items-center gap-1.5 text-sm text-textMuted hover:text-textPrimary">
          <ArrowLeft className="h-4 w-4" /> Back to Ads
        </Link>
        <p className="mt-6 text-sm text-textMuted">No data found for this ad.</p>
      </div>
    );
  }

  // Sort ascending for charts; skip days with zero activity
  const sortedRows = [...deduped].sort((a, b) => a.dateStart.localeCompare(b.dateStart));
  const chartData  = sortedRows
    .filter((r) => r.impressions > 0 || r.spend > 0)
    .map((row) => ({
      date:        row.dateStart.slice(5), // MM-DD
      spend:       row.spend,
      clicks:      row.clicks,
      impressions: row.impressions,
      ctr:         row.ctrPct
    }));

  // Oldest and newest dates with actual data
  const firstDate = sortedRows[0]?.dateStart ?? "";
  const lastDate  = sortedRows[sortedRows.length - 1]?.dateStart ?? "";

  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">

      {/* ── Back + Header ── */}
      <div>
        <Link href="/meta-analytics?tab=ads" className="inline-flex items-center gap-1.5 text-sm text-textMuted hover:text-textPrimary">
          <ArrowLeft className="h-4 w-4" /> Back to Ads
        </Link>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Meta Ad</p>
            <h1 className="mt-1 break-words text-2xl font-bold text-textPrimary">{adName}</h1>
            {firstDate && lastDate && (
              <p className="mt-1 text-sm text-textSecondary">
                {firstDate} → {lastDate} · {deduped.length} days of data
              </p>
            )}
          </div>
          {adLink && (
            <a
              href={adLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-textPrimary hover:bg-surfaceElevated"
            >
              <ExternalLink className="h-4 w-4" /> View on Facebook
            </a>
          )}
        </div>
      </div>

      {/* ── Metric cards ── */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-textSecondary">
          Performance Overview
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Total Spend"  value={formatCurrency(agg.spend)}      icon={DollarSign} />
          <MetricCard label="Impressions"  value={formatNumber(agg.impressions)}   icon={Eye} />
          <MetricCard label="Clicks"       value={formatNumber(agg.clicks)}        icon={MousePointer} />
          <MetricCard label="Reach"        value={formatNumber(agg.reach)}         icon={Users} />
          <MetricCard label="CTR"          value={formatPercent(agg.ctrPct)}       icon={TrendingUp} />
          <MetricCard label="CPC"          value={formatCurrency(agg.cpc)}         icon={DollarSign} />
          <MetricCard label="CPM"          value={formatCurrency(agg.cpm)}         icon={BarChart2} />
          <MetricCard label="Frequency"    value={agg.frequency.toFixed(2)}        hint="avg impressions per person" />
        </div>
      </section>

      {/* ── Charts ── */}
      {chartData.length > 1 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-textSecondary">Daily Spend</p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGradMeta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0081FB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0081FB" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" />
                  <YAxis {...axisProps} tickFormatter={(v: number) => `$${v}`} width={55} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const d = payload[0].payload as (typeof chartData)[number];
                      return (
                        <div style={{ background: SURFACE, border: `1px solid ${GRID_COLOR}`, borderRadius: 8, padding: 10 }} className="text-xs">
                          <p className="font-medium text-white">{d.date}</p>
                          <p className="text-textSecondary">{formatCurrency(d.spend)}</p>
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#0081FB" strokeWidth={2} fill="url(#spendGradMeta)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-textSecondary">Daily Clicks</p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" />
                  <YAxis {...axisProps} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const d = payload[0].payload as (typeof chartData)[number];
                      return (
                        <div style={{ background: SURFACE, border: `1px solid ${GRID_COLOR}`, borderRadius: 8, padding: 10 }} className="text-xs">
                          <p className="font-medium text-white">{d.date}</p>
                          <p className="text-textSecondary">{formatNumber(d.clicks)} clicks · {formatPercent(d.ctr)} CTR</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="clicks" fill="#4ade80" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {/* ── Daily breakdown table ── */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-textSecondary">Daily Breakdown</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-textMuted">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Spend</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Impressions</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Clicks</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">CTR</th>
                <th className="pb-2 font-medium tabular-nums">CPC</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-textSecondary">{row.dateStart}</td>
                  <td className="py-2 pr-4 tabular-nums text-textPrimary">{formatCurrency(row.spend)}</td>
                  <td className="py-2 pr-4 tabular-nums text-textSecondary">{formatNumber(row.impressions)}</td>
                  <td className="py-2 pr-4 tabular-nums text-textSecondary">{formatNumber(row.clicks)}</td>
                  <td className="py-2 pr-4 tabular-nums text-textSecondary">{formatPercent(row.ctrPct)}</td>
                  <td className="py-2 tabular-nums text-textSecondary">{formatCurrency(row.cpc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Ad preview ── */}
      {adLink && (
        <section className="rounded-xl border border-border bg-surface">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">Ad Preview</p>
              <span className="rounded-full bg-surfaceElevated px-2 py-0.5 text-[10px] text-textMuted">
                Live embed
              </span>
            </div>
            <a
              href={adLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Open in {getAdPlatform(adLink) === "instagram" ? "Instagram" : getAdPlatform(adLink) === "facebook" ? "Facebook" : "browser"}
            </a>
          </div>

          {/* Dark surround so the white embed sits inside a framed context */}
          <div className="rounded-b-xl bg-[#0a0a0a] px-4 py-6">
            {getAdPlatform(adLink) === "instagram" && <InstagramEmbed url={adLink} />}
            {getAdPlatform(adLink) === "facebook" && <FacebookEmbed url={adLink} />}
            {getAdPlatform(adLink) === "other" && (
              <p className="break-all text-sm text-textSecondary">{adLink}</p>
            )}
          </div>
        </section>
      )}

      {/* ── AI Suggestions ── */}
      {showSuggestions ? (
        <AdSuggestionsCard adId={context.adId} adName={adName} platform="meta" context={context} onClose={() => setShowSuggestions(false)} />
      ) : (
        <button type="button" onClick={() => setShowSuggestions(true)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-textPrimary hover:bg-surfaceElevated">
          Show AI Suggestions
        </button>
      )}
    </div>
  );
}
