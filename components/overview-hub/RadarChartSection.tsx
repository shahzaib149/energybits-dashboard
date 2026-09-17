"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const GRID = "#2A2A30";
const SURFACE = "#16161A";

interface RadarDatum {
  channel: string;
  score: number;
  fullMark: number;
  color: string;
}

export default function RadarChartSection({ data }: { data: RadarDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="channel" tick={{ fill: "#A1A1AA", fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const row = payload[0].payload as RadarDatum;
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
  );
}
