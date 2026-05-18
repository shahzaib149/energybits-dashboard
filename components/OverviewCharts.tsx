"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const pieColors = ["#0f766e", "#2563eb", "#f59e0b", "#f97316", "#22c55e", "#06b6d4", "#16a34a"];
const barColor = "#0f766e";

interface Datum {
  name: string;
  value: number;
}

interface OverviewChartsProps {
  blogStatuses: Datum[];
  priorities: Datum[];
  platforms: Datum[];
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="h-72">{children}</div>
    </div>
  );
}

export function OverviewCharts({ blogStatuses, priorities, platforms }: OverviewChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <ChartCard title="Blog Pipeline Status Breakdown">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={blogStatuses} dataKey="value" nameKey="name" innerRadius={60} outerRadius={92} paddingAngle={2}>
              {blogStatuses.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Keywords by Priority">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={priorities}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill={barColor} radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="AEO Tracking by Platform">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={platforms}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={56} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
