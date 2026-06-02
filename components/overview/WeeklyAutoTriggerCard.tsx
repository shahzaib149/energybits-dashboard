"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Clock, RefreshCw, XCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CronSettings } from "@/lib/cron/settings";

interface WeeklyAutoTriggerCardProps {
  userRole: string | null;
  webhookConfigured: boolean;
}

export function WeeklyAutoTriggerCard({ userRole, webhookConfigured }: WeeklyAutoTriggerCardProps) {
  const isAdmin = userRole === "admin";
  const [settings, setSettings] = useState<CronSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cron/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data as CronSettings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle() {
    if (!settings || !isAdmin || toggling) return;
    setToggling(true);
    setToggleError(null);
    try {
      const res = await fetch("/api/cron/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !settings.enabled })
      });
      if (res.ok) {
        setSettings((prev) => (prev ? { ...prev, enabled: !prev.enabled } : prev));
      } else {
        setToggleError("Failed to update. Please try again.");
      }
    } catch {
      setToggleError("Failed to update. Please try again.");
    } finally {
      setToggling(false);
    }
  }

  if (!webhookConfigured) return null;

  if (loading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-border bg-surface px-6 py-5 sm:px-8">
        <div className="h-14 animate-pulse rounded-lg bg-surfaceElevated" />
      </section>
    );
  }

  const nextRun = getNextMondayAt9AMUTC();
  const nextRunLabel = settings?.enabled ? formatNextRun(nextRun) : "—";

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface px-6 py-5 sm:px-8">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
            <Zap className="h-4 w-4 text-brand" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-textPrimary">Weekly Auto-Trigger</h3>
            <p className="mt-0.5 text-xs text-textSecondary">
              Sends the full intelligence report to Make.com every{" "}
              <span className="font-medium text-textPrimary">Monday at 9:00 AM UTC</span> — generates
              keywords, prompts &amp; two blogs automatically
            </p>
          </div>
        </div>

        {isAdmin && settings ? (
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            aria-pressed={settings.enabled}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              settings.enabled
                ? "border-brand/40 bg-brand/10 text-brand hover:bg-brand/20"
                : "border-border bg-surfaceElevated text-textSecondary hover:text-textPrimary",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full transition-colors",
                settings.enabled ? "bg-brand" : "bg-textMuted"
              )}
            />
            {toggling ? "Saving…" : settings.enabled ? "Enabled" : "Disabled"}
          </button>
        ) : settings ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              settings.enabled
                ? "border-brand/30 bg-brand/10 text-brand"
                : "border-border bg-surfaceElevated text-textMuted"
            )}
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                settings.enabled ? "bg-brand" : "bg-textMuted"
              )}
            />
            {settings.enabled ? "Enabled" : "Disabled"}
          </span>
        ) : null}
      </div>

      {/* Status grid */}
      {settings ? (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <StatusItem
            icon={<Clock className="h-3.5 w-3.5 text-textMuted" />}
            label="Next run"
            value={nextRunLabel}
          />
          <StatusItem
            icon={<LastRunIcon status={settings.last_run_status} />}
            label="Last run"
            value={formatLastRun(settings)}
            valueClass={
              settings.last_run_status === "error"
                ? "text-red-400"
                : settings.last_run_status === "running"
                  ? "text-amber-400"
                  : undefined
            }
          />
        </div>
      ) : null}

      {/* Error details */}
      {settings?.last_run_status === "error" && settings.last_run_error ? (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          {settings.last_run_error}
        </p>
      ) : null}

      {toggleError ? (
        <p className="mt-2 text-xs text-red-400">{toggleError}</p>
      ) : null}
    </section>
  );
}

function LastRunIcon({ status }: { status: CronSettings["last_run_status"] }) {
  if (status === "success") return <CheckCircle2 className="h-3.5 w-3.5 text-brand" />;
  if (status === "error") return <XCircle className="h-3.5 w-3.5 text-red-400" />;
  if (status === "running") return <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />;
  return <Calendar className="h-3.5 w-3.5 text-textMuted" />;
}

function StatusItem({
  icon,
  label,
  value,
  valueClass
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surfaceElevated px-3 py-2">
      {icon}
      <span className="text-xs text-textMuted">{label}</span>
      <span className={cn("ml-auto truncate text-xs font-medium text-textPrimary", valueClass)}>
        {value}
      </span>
    </div>
  );
}

function getNextMondayAt9AMUTC(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon … 6=Sat
  let daysUntil: number;
  if (day === 1) {
    const pastTrigger = now.getUTCHours() > 9 || (now.getUTCHours() === 9 && now.getUTCMinutes() > 0);
    daysUntil = pastTrigger ? 7 : 0;
  } else {
    daysUntil = (8 - day) % 7;
  }
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + daysUntil);
  next.setUTCHours(9, 0, 0, 0);
  return next;
}

function formatNextRun(date: Date): string {
  const diff = date.getTime() - Date.now();
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const countdown = days > 0 ? `in ${days}d ${hours}h` : hours > 0 ? `in ${hours}h` : "soon";
  const label = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
  return `${label} · 9:00 AM UTC · ${countdown}`;
}

function formatLastRun(settings: CronSettings): string {
  if (settings.last_run_status === "running") return "Running now…";
  if (!settings.last_run_at) return "Never";

  const dateLabel = new Date(settings.last_run_at).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });

  if (settings.last_run_status === "error") return `${dateLabel} · Failed`;
  if (settings.last_run_status === "success") {
    const gaps = settings.last_run_gap_count ?? 0;
    return `${dateLabel} · ${gaps} gap${gaps !== 1 ? "s" : ""} found`;
  }
  return dateLabel;
}
