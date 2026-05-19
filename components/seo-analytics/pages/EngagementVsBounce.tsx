"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GA4PageRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { CHART_COLORS, chartAxisProps } from "@/components/seo-analytics/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";

function truncatePath(path: string, max = 24): string {
  if (path.length <= max) return path;
  return `${path.slice(0, max)}…`;
}

export function EngagementVsBounce({ pages }: { pages: GA4PageRow[] }) {
  const copy = COPY.seoAnalytics.pages.engagementVsBounce;
  const data = [...pages]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10)
    .map((page) => ({
      page: truncatePath(page.pagePath || "/"),
      engagement: page.engagementRatePct,
      bounce: page.bounceRatePct
    }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="page" angle={-30} textAnchor="end" height={70} {...chartAxisProps} />
            <YAxis unit="%" {...chartAxisProps} />
            <Tooltip
              contentStyle={{
                background: CHART_COLORS.surface,
                border: `1px solid ${CHART_COLORS.grid}`,
                borderRadius: 8,
                color: "#FFFFFF"
              }}
            />
            <Legend />
            <Bar dataKey="engagement" name="Engagement %" fill={CHART_COLORS.brand} radius={[4, 4, 0, 0]} />
            <Bar dataKey="bounce" name="Bounce %" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
