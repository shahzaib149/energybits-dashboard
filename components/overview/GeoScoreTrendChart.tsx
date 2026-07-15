"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from "recharts";
import type { AIReadinessScore } from "@/lib/cairrot/types";
import { OVERVIEW_CHART_COLORS, overviewChartTooltipStyle, overviewChartAxisProps } from "@/components/overview/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatDateShort } from "@/lib/date-range/format";

interface ScoreBar {
  label: string;
  value: number;
  color: string;
  date: string | null;
}

interface GeoScoreTrendChartProps {
  geo: AIReadinessScore;
}

export function GeoScoreTrendChart({ geo }: GeoScoreTrendChartProps) {
  // Cairrot only exposes first/best/worst/current readiness scores, not a
  // run-by-run history — nothing to compare against until a first score exists.
  if (geo.firstScore === null) return null;

  const delta = geo.overallScore - geo.firstScore;
  const deltaLabel = `${delta > 0 ? "+" : ""}${delta} pts`;
  const deltaColor = delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-textMuted";

  const bars: ScoreBar[] = [
    { label: "First", value: geo.firstScore, color: OVERVIEW_CHART_COLORS.gray, date: geo.firstScoredAt },
    ...(geo.worstScore !== null
      ? [{ label: "Worst", value: geo.worstScore, color: OVERVIEW_CHART_COLORS.red, date: null }]
      : []),
    ...(geo.bestScore !== null
      ? [{ label: "Best", value: geo.bestScore, color: OVERVIEW_CHART_COLORS.brand, date: null }]
      : []),
    { label: "Current", value: geo.overallScore, color: OVERVIEW_CHART_COLORS.blue, date: geo.lastUpdated }
  ];

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle
        title="Readiness Score Trend"
        subtitle={
          geo.firstScoredAt
            ? `Since first scored on ${formatDateShort(geo.firstScoredAt.slice(0, 10))}`
            : "AI readiness score movement"
        }
      />
      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-bold tabular-nums text-textPrimary">{geo.overallScore}</p>
        <p className={`text-sm font-semibold ${deltaColor}`}>{deltaLabel} vs first score</p>
      </div>
      <div className="mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={OVERVIEW_CHART_COLORS.grid} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} {...overviewChartAxisProps} />
            <YAxis
              type="category"
              dataKey="label"
              width={70}
              {...overviewChartAxisProps}
              tick={{ fill: OVERVIEW_CHART_COLORS.text, fontSize: 12 }}
            />
            <Tooltip content={<ScoreTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
              {bars.map((bar) => (
                <Cell key={bar.label} fill={bar.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ScoreTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ScoreBar;

  return (
    <div style={overviewChartTooltipStyle} className="px-3 py-2 text-xs">
      <p className="mb-1 font-medium text-white">{point.label}</p>
      <p className="text-textSecondary">
        Score: <span className="text-white">{point.value}</span>
      </p>
      {point.date ? (
        <p className="text-textSecondary">
          {new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      ) : null}
    </div>
  );
}
