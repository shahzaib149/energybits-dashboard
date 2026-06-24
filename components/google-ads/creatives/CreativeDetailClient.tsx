"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MousePointer, Eye, DollarSign, TrendingUp, BarChart2, Target } from "lucide-react";
import type { GoogleAdsCreativeRow, GoogleAdsCampaignRow, GoogleAdsPreviewRow } from "@/lib/google-ads/types";
import type { GoogleAdContext } from "@/lib/suggestions/types";
import { GoogleAdPreview } from "@/components/google-ads/creatives/GoogleAdPreview";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdSuggestionsCard } from "@/components/suggestions/AdSuggestionsCard";
import { formatCurrency, formatNumber, formatPercent, formatRoas, formatDate } from "@/lib/utils/format";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function aggregateRows(rows: GoogleAdsCreativeRow[]) {
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const cost = rows.reduce((s, r) => s + r.cost, 0);
  const conversions = rows.reduce((s, r) => s + r.conversions, 0);
  const conversionValue = rows.reduce((s, r) => s + r.conversionValue, 0);
  const ctrPct = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const averageCpc = clicks > 0 ? cost / clicks : 0;
  const costPerConversion = conversions > 0 ? cost / conversions : 0;
  const conversionRatePct = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const roas = cost > 0 ? conversionValue / cost : 0;
  return { clicks, impressions, cost, conversions, conversionValue, ctrPct, averageCpc, costPerConversion, conversionRatePct, roas };
}

function buildContext(
  adName: string,
  rows: GoogleAdsCreativeRow[],
  campaigns: GoogleAdsCampaignRow[],
  agg: ReturnType<typeof aggregateRows>
): GoogleAdContext {
  const first = rows[0];
  const campaign = campaigns.find((c) => c.campaignId === first?.campaignId);
  return {
    platform: "google",
    adId: first?.adId || first?.id || adName,
    adName,
    adType: first?.adType ?? "",
    campaignName: first?.campaignName ?? "",
    adGroupName: first?.adGroupName ?? "",
    spend: agg.cost,
    impressions: agg.impressions,
    clicks: agg.clicks,
    ctrPct: agg.ctrPct,
    averageCpc: agg.averageCpc,
    conversions: agg.conversions,
    conversionValue: agg.conversionValue,
    costPerConversion: agg.costPerConversion,
    conversionRatePct: agg.conversionRatePct,
    roas: agg.roas,
    optimizationScore: campaign?.optimizationScore ?? 0,
    creativeTagSuggestions: first?.creativeTagSuggestions ?? "",
    accountAverageCtrPct: agg.ctrPct,
    accountAverageRoas: agg.roas,
    accountAverageConversionRatePct: agg.conversionRatePct
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreativeDetailClient({
  adName,
  rows,
  campaigns,
}: {
  adName: string;
  rows: GoogleAdsCreativeRow[];
  campaigns: GoogleAdsCampaignRow[];
}) {
  const agg = aggregateRows(rows);
  const context = buildContext(adName, rows, campaigns, agg);
  const first = rows[0];

  // Fetch preview client-side to avoid server module caching issues
  const [preview, setPreview] = useState<GoogleAdsPreviewRow | null>(null);
  useEffect(() => {
    const adId = first?.adId ?? "";
    const params = new URLSearchParams();
    if (adId)   params.set("adId", adId);
    if (adName) params.set("adName", adName);
    fetch(`/api/google-ads/preview?${params.toString()}`)
      .then(r => r.json())
      .then((data: { preview: GoogleAdsPreviewRow | null }) => {
        if (data.preview) setPreview(data.preview);
      })
      .catch(() => {/* silent */});
  }, [adName, first?.adId]);
  const dateRange =
    rows.length > 0
      ? `${formatDate(rows[rows.length - 1].date)} – ${formatDate(rows[0].date)}`
      : null;

  const [showSuggestions, setShowSuggestions] = useState(true);
  const [breakdownPage, setBreakdownPage] = useState(0);
  const ROWS_PER_PAGE = 10;

  // Aggregate rows by date so same-day multi-adgroup rows collapse
  const dailyRows = useMemo(() => {
    const map = new Map<string, typeof rows[number] & { _count: number }>();
    for (const r of rows) {
      const key = r.date;
      const ex = map.get(key);
      if (!ex) {
        map.set(key, { ...r, _count: 1 });
      } else {
        ex.cost += r.cost;
        ex.impressions += r.impressions;
        ex.clicks += r.clicks;
        ex.conversions += r.conversions;
        ex.conversionValue += r.conversionValue;
        ex.roas = ex.cost > 0 ? ex.conversionValue / ex.cost : 0;
        ex._count++;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [rows]);

  const totalBreakdownPages = Math.ceil(dailyRows.length / ROWS_PER_PAGE);
  const pagedRows = dailyRows.slice(breakdownPage * ROWS_PER_PAGE, (breakdownPage + 1) * ROWS_PER_PAGE);

  if (rows.length === 0) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <Link href="/google-ads-analytics?tab=creatives" className="mb-6 inline-flex items-center gap-1.5 text-sm text-textMuted hover:text-textPrimary">
          <ArrowLeft className="h-4 w-4" /> Back to Creatives
        </Link>
        <p className="text-sm text-textMuted">No data found for this ad.</p>
      </div>
    );
  }

  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
      {/* Back nav */}
      <Link
        href="/google-ads-analytics?tab=creatives"
        className="inline-flex items-center gap-1.5 text-sm text-textMuted hover:text-textPrimary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Creatives
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Google Ad</p>
            {first?.adType && (
              <StatusBadge variant="muted">{first.adType.replace(/_/g, " ")}</StatusBadge>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-textPrimary break-words">{adName}</h1>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-textSecondary">
            {first?.campaignName && <span>{first.campaignName}</span>}
            {first?.adGroupName && <span>· {first.adGroupName}</span>}
            {dateRange && <span>· {dateRange}</span>}
          </div>
        </div>
      </div>

      {/* Ad Preview */}
      <GoogleAdPreview preview={preview} adName={adName} />

      {/* Creative tag suggestions from Airtable */}
      {first?.creativeTagSuggestions && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-textSecondary">Creative Tags</p>
          <p className="text-sm text-textPrimary">{first.creativeTagSuggestions}</p>
        </section>
      )}

      {/* Metrics */}
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">Analytics</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="Spend" value={formatCurrency(agg.cost)} icon={DollarSign} />
          <MetricCard label="Impressions" value={formatNumber(agg.impressions)} icon={Eye} />
          <MetricCard label="Clicks" value={formatNumber(agg.clicks)} icon={MousePointer} />
          <MetricCard label="CTR" value={formatPercent(agg.ctrPct)} icon={TrendingUp} />
          <MetricCard label="Avg. CPC" value={formatCurrency(agg.averageCpc)} icon={DollarSign} />
          <MetricCard label="Conversions" value={formatNumber(agg.conversions)} icon={Target} />
          <MetricCard label="Conv. Rate" value={formatPercent(agg.conversionRatePct)} icon={BarChart2} />
          <MetricCard label="ROAS" value={formatRoas(agg.roas)} hint="return on ad spend" />
          <MetricCard label="Cost / Conv." value={formatCurrency(agg.costPerConversion)} />
          <MetricCard label="Conv. Value" value={formatCurrency(agg.conversionValue)} />
        </div>
      </section>

      {/* Daily breakdown — paginated, deduplicated by date */}
      {dailyRows.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
              Daily Breakdown <span className="ml-1 font-normal text-textMuted">({dailyRows.length} days)</span>
            </p>
            {totalBreakdownPages > 1 && (
              <div className="flex items-center gap-2 text-xs text-textMuted">
                <button
                  onClick={() => setBreakdownPage(p => Math.max(0, p - 1))}
                  disabled={breakdownPage === 0}
                  className="rounded border border-border px-2 py-0.5 hover:bg-surfaceElevated disabled:opacity-40"
                >
                  ‹ Prev
                </button>
                <span>{breakdownPage + 1} / {totalBreakdownPages}</span>
                <button
                  onClick={() => setBreakdownPage(p => Math.min(totalBreakdownPages - 1, p + 1))}
                  disabled={breakdownPage === totalBreakdownPages - 1}
                  className="rounded border border-border px-2 py-0.5 hover:bg-surfaceElevated disabled:opacity-40"
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-textMuted">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium tabular-nums">Spend</th>
                  <th className="pb-2 pr-4 font-medium tabular-nums">Impressions</th>
                  <th className="pb-2 pr-4 font-medium tabular-nums">Clicks</th>
                  <th className="pb-2 pr-4 font-medium tabular-nums">Conv.</th>
                  <th className="pb-2 font-medium tabular-nums">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.date} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-textSecondary">{row.date}</td>
                    <td className="py-2 pr-4 tabular-nums text-textPrimary">{formatCurrency(row.cost)}</td>
                    <td className="py-2 pr-4 tabular-nums text-textSecondary">{formatNumber(row.impressions)}</td>
                    <td className="py-2 pr-4 tabular-nums text-textSecondary">{formatNumber(row.clicks)}</td>
                    <td className="py-2 pr-4 tabular-nums text-textSecondary">{formatNumber(row.conversions)}</td>
                    <td className="py-2 tabular-nums font-medium text-brand">{formatRoas(row.roas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Suggestions */}
      {showSuggestions ? (
        <AdSuggestionsCard
          adId={context.adId}
          adName={adName}
          platform="google"
          context={context}
          onClose={() => setShowSuggestions(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowSuggestions(true)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-textPrimary hover:bg-surfaceElevated"
        >
          Show AI Suggestions
        </button>
      )}
    </div>
  );
}
