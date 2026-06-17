"use client";

import type { GA4PageRow } from "@/lib/airtable/types";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils/format";

interface HealthMetric {
  label: string;
  score: number;
  display: string;
  raw: string;
}

function computeHealth(pages: GA4PageRow[]) {
  if (pages.length === 0) return null;

  const totalSessions = pages.reduce((s, p) => s + p.sessions, 0) || 1;
  const totalActiveUsers = pages.reduce((s, p) => s + p.activeUsers, 0) || 1;
  const totalNewUsers = pages.reduce((s, p) => s + p.newUsers, 0);
  const totalEngagedSessions = pages.reduce((s, p) => s + p.engagedSessions, 0);

  const engagementRate = pages.reduce((s, p) => s + p.engagementRatePct * p.sessions, 0) / totalSessions;
  const bounceRate = pages.reduce((s, p) => s + p.bounceRatePct * p.sessions, 0) / totalSessions;
  const avgDuration = pages.reduce((s, p) => s + p.averageSessionDuration * p.sessions, 0) / totalSessions;

  const engagementScore = Math.min(100, Math.max(0, engagementRate));
  const bounceScore = Math.min(100, Math.max(0, 100 - bounceRate));
  const durationScore = Math.min(100, (avgDuration / 180) * 100);
  const newVisitorScore = Math.min(100, (totalNewUsers / totalActiveUsers) * 100);
  const contentQualityScore = Math.min(100, (totalEngagedSessions / totalSessions) * 100);

  const overallScore = Math.round(
    engagementScore * 0.25 +
      bounceScore * 0.25 +
      durationScore * 0.2 +
      newVisitorScore * 0.15 +
      contentQualityScore * 0.15
  );

  const metrics: HealthMetric[] = [
    { label: "Engagement Rate", score: Math.round(engagementScore), display: formatPercent(engagementRate), raw: `${engagementScore.toFixed(0)}/100` },
    { label: "Bounce Rate", score: Math.round(bounceScore), display: formatPercent(bounceRate), raw: `Score ${bounceScore.toFixed(0)}/100` },
    { label: "Session Duration", score: Math.round(durationScore), display: formatDuration(avgDuration), raw: `${durationScore.toFixed(0)}/100` },
    { label: "New Visitor Rate", score: Math.round(newVisitorScore), display: formatPercent((totalNewUsers / totalActiveUsers) * 100), raw: `${formatNumber(totalNewUsers)} new` },
    { label: "Content Quality", score: Math.round(contentQualityScore), display: formatPercent((totalEngagedSessions / totalSessions) * 100), raw: `${formatNumber(totalEngagedSessions)} engaged` },
  ];

  return { overallScore, metrics, totalSessions };
}

function scoreColor(score: number): string {
  if (score >= 70) return "#34d399"; // emerald-400
  if (score >= 45) return "#fbbf24"; // amber-400
  return "#f87171"; // red-400
}

function scoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-500/20";
  if (score >= 45) return "bg-amber-500/20";
  return "bg-red-500/20";
}

function scoreLabel(score: number): string {
  if (score >= 70) return "Good";
  if (score >= 45) return "Fair";
  return "Needs Work";
}

function DonutGauge({ score }: { score: number }) {
  const radius = 54;
  const cx = 64;
  const cy = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = scoreColor(score);

  return (
    <svg width={128} height={128} viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={12}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={26} fontWeight={700} fontFamily="inherit">
        {score}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11} fontFamily="inherit">
        Health Score
      </text>
    </svg>
  );
}

function MetricBar({ metric }: { metric: HealthMetric }) {
  const color = scoreColor(metric.score);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-textSecondary">{metric.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-textPrimary">{metric.display}</span>
          <span className="text-xs font-semibold tabular-nums" style={{ color }}>
            {metric.score}%
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${metric.score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function GA4HealthCard({ pages }: { pages: GA4PageRow[] }) {
  const health = computeHealth(pages);

  if (!health) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-textMuted">No GA4 page data available for this period.</p>
      </section>
    );
  }

  const { overallScore, metrics, totalSessions } = health;
  const labelColor = scoreColor(overallScore);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-textPrimary">Page Performance Health</h2>
          <p className="mt-0.5 text-xs text-textMuted">
            Across {formatNumber(pages.length)} pages · {formatNumber(totalSessions)} total sessions
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBg(overallScore)}`}
          style={{ color: labelColor }}
        >
          {scoreLabel(overallScore)}
        </span>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Donut gauge */}
        <div className="flex shrink-0 justify-center">
          <DonutGauge score={overallScore} />
        </div>

        {/* Metric bars */}
        <div className="flex-1 space-y-4">
          {metrics.map((m) => (
            <MetricBar key={m.label} metric={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
