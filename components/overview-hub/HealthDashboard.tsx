"use client";

import Link from "next/link";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { ArrowRight } from "lucide-react";
import type { ChannelHealthScore } from "@/lib/overview/health-scores";
import { statusLabel } from "@/lib/overview/health-scores";
import type { AnalyticsChannelSummary } from "@/lib/overview/summary";
import { cn } from "@/lib/utils";

const GRID = "#2A2A30";
const SURFACE = "#16161A";

const statusColors = {
  excellent: "text-brand border-brand/40 bg-brand/10",
  good: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  fair: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  "needs-attention": "text-red-400 border-red-500/40 bg-red-500/10",
  unavailable: "text-textMuted border-border bg-surfaceElevated"
};

function overallGrade(score: number): { label: string; tone: string } {
  if (score >= 80) return { label: "Strong", tone: "text-brand" };
  if (score >= 60) return { label: "Good", tone: "text-emerald-400" };
  if (score >= 40) return { label: "Mixed", tone: "text-amber-400" };
  if (score > 0) return { label: "Needs work", tone: "text-red-400" };
  return { label: "—", tone: "text-textMuted" };
}

export function HealthDashboard({
  overallScore,
  standingLabel,
  healthScores,
  projectUrl
}: {
  overallScore: number;
  standingLabel: string;
  healthScores: ChannelHealthScore[];
  projectUrl: string | null;
}) {
  const grade = overallGrade(overallScore);
  const radarData = healthScores.map((s) => ({
    channel: s.shortLabel,
    score: s.configured ? s.score : 0,
    fullMark: 100,
    color: s.color
  }));

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Hero strip */}
      <div className="relative border-b border-border bg-gradient-to-br from-brand/10 via-surface to-amber-500/5 px-6 py-8 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/5 via-transparent to-transparent" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-widest text-brand">Brand health snapshot</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-textPrimary sm:text-2xl">
              Where ENERGYbits stands today
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-textSecondary">{standingLabel}</p>
            {projectUrl ? (
              <p className="mt-2 text-xs text-textMuted">
                Tracking <span className="font-medium text-textSecondary">{projectUrl}</span>
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke={GRID} strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#1FBA5A"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${overallScore * 2.64} 264`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center">
                <p className={cn("text-3xl font-bold tabular-nums sm:text-4xl", grade.tone)}>
                  {overallScore > 0 ? overallScore : "—"}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-textMuted">Overall</p>
              </div>
            </div>
            <div>
              <p className={cn("text-lg font-semibold", grade.tone)}>{grade.label}</p>
              <p className="mt-1 max-w-[140px] text-xs leading-relaxed text-textMuted">
                Combined score across SEO, AEO, GEO &amp; paid ads
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart + channel bars */}
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-5">
        <div className="border-b border-border p-6 lg:col-span-2 lg:border-b-0 lg:border-r">
          <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Channel balance</p>
          <p className="mt-1 text-sm text-textSecondary">How each area compares on a 0–100 scale</p>
          <div className="mt-4 h-[280px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke={GRID} />
                <PolarAngleAxis dataKey="channel" tick={{ fill: "#A1A1AA", fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const row = payload[0].payload as (typeof radarData)[number];
                    return (
                      <div
                        style={{ background: SURFACE, border: `1px solid ${GRID}`, borderRadius: 8, padding: 12 }}
                        className="text-xs"
                      >
                        <p className="font-medium text-white">{row.channel}</p>
                        <p className="text-textSecondary">Health score: {row.score}/100</p>
                      </div>
                    );
                  }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#1FBA5A"
                  fill="#1FBA5A"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 lg:col-span-3">
          {healthScores.map((channel) => (
            <ChannelHealthRow key={channel.id} channel={channel} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChannelHealthRow({ channel }: { channel: ChannelHealthScore }) {
  const width = channel.configured ? Math.max(channel.score, 4) : 0;

  return (
    <Link
      href={channel.href}
      className="group block rounded-xl border border-border/60 bg-surfaceElevated/50 p-4 transition hover:border-border hover:bg-surfaceElevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: channel.color }} />
            <p className="font-medium text-textPrimary">{channel.label}</p>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase", statusColors[channel.status])}>
              {statusLabel(channel.status)}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-textMuted">{channel.insight}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold tabular-nums text-textPrimary">
            {channel.configured ? channel.score : "—"}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-textMuted">{channel.primaryMetric}</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${width}%`, backgroundColor: channel.color }}
        />
      </div>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-textMuted group-hover:text-brand">
        Open analytics
        <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function HubOverviewHeader() {
  return (
    <header>
      <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Dashboard</p>
      <h1 className="mt-1 text-2xl font-semibold text-textPrimary lg:text-3xl">Overview</h1>
      <p className="mt-1 max-w-2xl text-sm text-textSecondary">
        One glance at how ENERGYbits is performing — then drill into any channel for full charts and details.
      </p>
    </header>
  );
}

export function QuickChannelLinks({ channels }: { channels: AnalyticsChannelSummary[] }) {
  return (
    <section>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-textMuted">Explore full analytics</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {channels.map((channel) => (
          <Link
            key={channel.id}
            href={channel.href}
            className="group flex flex-col rounded-xl border border-border bg-surface p-4 transition hover:border-brand/30 hover:bg-surfaceElevated"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-textMuted">{channel.headline}</p>
            {channel.stats[0] ? (
              <p className="mt-2 text-lg font-bold tabular-nums text-textPrimary">{channel.stats[0].value}</p>
            ) : (
              <p className="mt-2 text-sm text-textMuted">Not connected</p>
            )}
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-brand opacity-0 transition group-hover:opacity-100">
              View <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
