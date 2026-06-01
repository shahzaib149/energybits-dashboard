"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download, Loader2, Sparkles } from "lucide-react";
import { COPY } from "@/lib/copy";
import type { CombinedIntelligenceReport, IntelligenceGapSummary } from "@/lib/reports/types";
import type { DateRange } from "@/lib/date-range/types";
import { reportQueryFromDateRange } from "@/lib/reports/parse-report-params";
import { cn } from "@/lib/utils";

const TRIGGER_COOLDOWN_MS = 60_000;

export interface IntelligenceGapsCardProps {
  gaps: IntelligenceGapSummary;
  dateRange: DateRange;
  configured: boolean;
  webhookConfigured: boolean;
}

export function IntelligenceGapsCard({
  gaps,
  dateRange,
  configured,
  webhookConfigured
}: IntelligenceGapsCardProps) {
  const copy = COPY.hub.intelligenceGaps;
  const triggerCopy = copy.triggerAI;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  const query = reportQueryFromDateRange(dateRange);
  const busy = isDownloading || isTriggering;
  const onCooldown = cooldownUntil != null && Date.now() < cooldownUntil;

  useEffect(() => {
    if (!cooldownUntil) return;
    const remaining = cooldownUntil - Date.now();
    if (remaining <= 0) {
      setCooldownUntil(null);
      return;
    }
    const timer = setTimeout(() => setCooldownUntil(null), remaining);
    return () => clearTimeout(timer);
  }, [cooldownUntil]);

  async function fetchFreshReport(): Promise<CombinedIntelligenceReport> {
    const response = await fetch(`/api/reports/combined-intelligence?${query.toString()}`);
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? copy.downloadError);
    }
    return (await response.json()) as CombinedIntelligenceReport;
  }

  async function handleDownloadReport() {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const report = await fetchFreshReport();
      const dateStamp = new Date().toISOString().split("T")[0];
      const filename = `energybits-intelligence-report-${dateStamp}.json`;

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);

      await fetch("/api/reports/combined-intelligence/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: report.dateRange?.days ?? 28,
          gapCount: report.actionableGaps?.totalGaps ?? 0,
          filename
        })
      });
    } catch (err) {
      console.error("Failed to generate report:", err);
      setDownloadError(err instanceof Error ? err.message : copy.downloadError);
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleTriggerAI() {
    if (!webhookConfigured) {
      toast.error(copy.triggerNotConfigured);
      return;
    }

    if (onCooldown) {
      toast.error(triggerCopy.cooldown);
      return;
    }

    setIsTriggering(true);

    try {
      const response = await fetch(`/api/reports/trigger-recommendations?${query.toString()}`, {
        method: "POST"
      });
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? triggerCopy.error);
      }

      toast.success(data.message ?? triggerCopy.success);
      setCooldownUntil(Date.now() + TRIGGER_COOLDOWN_MS);
    } catch (err) {
      console.error("Failed to trigger AI recommendations:", err);
      toast.error(err instanceof Error ? err.message : triggerCopy.error);
    } finally {
      setIsTriggering(false);
    }
  }

  if (!configured) {
    return (
      <section className="overflow-hidden rounded-2xl border border-border bg-surface px-6 py-6 sm:px-8">
        <h3 className="text-base font-semibold text-textPrimary">{copy.title}</h3>
        <p className="mt-2 text-sm text-textSecondary">{copy.notConfigured}</p>
      </section>
    );
  }

  const triggerDisabled = busy || !webhookConfigured || onCooldown;
  const triggerTitle = !webhookConfigured
    ? copy.triggerNotConfigured
    : onCooldown
      ? triggerCopy.cooldown
      : copy.triggerTooltip;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-textPrimary">{copy.title}</h3>
          <p className="mt-1 text-sm text-textSecondary">{copy.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <GapBadge label={copy.critical} count={gaps.criticalGaps} tone="critical" />
          <GapBadge label={copy.high} count={gaps.highGaps} tone="high" />
          <GapBadge label={copy.medium} count={gaps.mediumGaps} tone="medium" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={busy}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            "bg-brand text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          {isDownloading ? copy.downloading : copy.downloadButton}
        </button>

        <button
          type="button"
          onClick={handleTriggerAI}
          disabled={triggerDisabled}
          title={triggerTitle}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
            webhookConfigured
              ? "border-brand/40 bg-brand/10 text-brand hover:bg-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
              : "cursor-not-allowed border-border text-textMuted opacity-60"
          )}
        >
          {isTriggering ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden />
          )}
          {isTriggering ? triggerCopy.loading : triggerCopy.button}
        </button>
      </div>

      {downloadError ? <p className="mt-3 text-sm text-red-400">{downloadError}</p> : null}
    </section>
  );
}

function GapBadge({
  label,
  count,
  tone
}: {
  label: string;
  count: number;
  tone: "critical" | "high" | "medium";
}) {
  const toneClasses = {
    critical: "border-red-500/40 bg-red-500/10 text-red-400",
    high: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    medium: "border-brand/40 bg-brand/10 text-brand"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
        toneClasses[tone]
      )}
    >
      <span className="font-semibold tabular-nums">{count}</span>
      {label}
    </span>
  );
}
