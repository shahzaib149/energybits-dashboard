"use client";

import {
  Activity,
  ArrowUpRight,
  CircleDot,
  Eye,
  Link2,
  ListChecks,
  Quote,
  Shield,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from "recharts";
import {
  competitorVisibilityCards,
  insightActionCards,
  llmAnalysisCards,
  nextActionItems,
  overviewSummaryMetrics,
  promptAnalysisCards,
  type OverviewBreakdownRow,
  type OverviewMetric,
  type OverviewTone
} from "@/lib/overview-analysis";
import { cn } from "@/lib/utils";

const toneHex: Record<OverviewTone, string> = {
  brand: "#16a34a",
  competitor: "#dc2626",
  neutral: "#0284c7",
  both: "#d97706",
  neither: "#f59e0b"
};

const toneText: Record<OverviewTone, string> = {
  brand: "text-emerald-700",
  competitor: "text-red-700",
  neutral: "text-sky-700",
  both: "text-amber-700",
  neither: "text-amber-700"
};

const priorityStyles = {
  High: "border-red-200 bg-red-50 text-red-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-sky-200 bg-sky-50 text-sky-700"
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function parseNumericValue(value: string) {
  return Number(value.replace(/[%,]/g, ""));
}

function sumBreakdown(rows: OverviewBreakdownRow[], tone: OverviewTone) {
  return rows.find((row) => row.tone === tone)?.percent ?? 0;
}

const llmChartData = llmAnalysisCards.map((card) => ({
  name: card.name,
  citations: card.citations,
  responses: card.responses,
  brand: sumBreakdown(card.citationBreakdown, "brand"),
  competitor: sumBreakdown(card.citationBreakdown, "competitor"),
  neutral: sumBreakdown(card.citationBreakdown, "neutral"),
  brandOnly: card.responseBreakdown.find((row) => row.label === "Brand only")?.percent ?? 0,
  compOnly: card.responseBreakdown.find((row) => row.label === "Comp only")?.percent ?? 0,
  neither: sumBreakdown(card.responseBreakdown, "neither")
}));

const promptChartData = promptAnalysisCards.map((card, index) => ({
  prompt: `P${index + 1}`,
  title: card.title,
  citations: card.citations,
  responses: card.responses,
  brand: sumBreakdown(card.citationBreakdown, "brand"),
  competitor: sumBreakdown(card.citationBreakdown, "competitor"),
  neutral: sumBreakdown(card.citationBreakdown, "neutral")
}));

const visibilityChartData = competitorVisibilityCards.map((card) => ({
  name: card.name,
  share: parseNumericValue(card.citationShare),
  prompts: parseNumericValue(card.promptCoverage)
}));

const trendData = [
  { label: "GPT", citations: 61, responses: 8 },
  { label: "Gemini", citations: 102, responses: 8 },
  { label: "Perplexity", citations: 66, responses: 8 }
];

function MetricIcon({ metric }: { metric: OverviewMetric }) {
  const icon = {
    citations: Quote,
    domains: Link2,
    responses: Eye,
    neutral: Shield,
    competitor: ShieldAlert
  }[metric.icon];
  const Icon = icon;

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm">
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

function MetricCard({ metric }: { metric: OverviewMetric }) {
  const supportingLabel =
    metric.icon === "neutral"
      ? "Citation mix"
      : metric.icon === "competitor"
        ? "Response mentions"
        : "Current snapshot";

  return (
    <div className="w-full min-w-[170px] shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 shadow-sm xl:min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{metric.label}</p>
          <p className="mt-0.5 text-lg font-semibold text-slate-950">{metric.value}</p>
        </div>
        <MetricIcon metric={metric} />
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
        <ArrowUpRight className="h-3 w-3 shrink-0 text-emerald-600" />
        <span>{supportingLabel}</span>
      </div>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  children,
  action
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {eyebrow ? <p className="text-[11px] font-medium uppercase text-slate-500">{eyebrow}</p> : null}
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">{title}</h2>
        </div>
        {action}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
    </section>
  );
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-slate-950">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-6 text-slate-600">
            <span>{item.name}</span>
            <span className="font-medium text-slate-950">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionRows({ rows }: { rows: OverviewBreakdownRow[] }) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="grid min-w-0 grid-cols-[minmax(56px,0.8fr)_minmax(56px,1fr)_auto] items-center gap-2 text-xs">
          <span className="min-w-0 truncate text-slate-600" title={row.label}>{row.label}</span>
          <div className="min-w-0 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, row.percent))}%`,
                backgroundColor: toneHex[row.tone]
              }}
            />
          </div>
          <span className={cn("text-right font-medium tabular-nums", toneText[row.tone])}>{formatPercent(row.percent)}</span>
        </div>
      ))}
    </div>
  );
}

function LLMPerformanceGrid() {
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
      {llmAnalysisCards.map((card) => (
        <div key={card.name} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">{card.name}</p>
                <p className="text-xs text-slate-500">{card.badge}</p>
              </div>
            </div>
            <div className="shrink-0 text-right text-xs text-slate-500">
              <p><span className="font-semibold text-slate-950">{card.citations}</span> citations</p>
              <p><span className="font-semibold text-slate-950">{card.responses}</span> responses</p>
            </div>
          </div>
          <div className="mt-3 grid min-w-0 gap-3">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-medium uppercase text-slate-500">Citations</p>
              <DistributionRows rows={card.citationBreakdown} />
            </div>
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-medium uppercase text-slate-500">Responses</p>
              <DistributionRows rows={card.responseBreakdown} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromptTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="grid grid-cols-[minmax(280px,1fr)_82px_82px_128px] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium uppercase text-slate-500">
        <span>Prompt</span>
        <span>Citations</span>
        <span>Responses</span>
        <span>Neutral Share</span>
      </div>
      <div className="max-h-[336px] divide-y divide-slate-100 overflow-y-auto">
        {promptAnalysisCards.map((prompt) => {
          const neutral = sumBreakdown(prompt.citationBreakdown, "neutral");

          return (
            <div
              key={prompt.title}
              className="grid grid-cols-[minmax(280px,1fr)_82px_82px_128px] gap-3 px-3 py-2 text-xs"
            >
              <p className="line-clamp-2 font-medium text-slate-800">{prompt.title}</p>
              <span className="font-medium tabular-nums text-slate-950">{prompt.citations}</span>
              <span className="font-medium tabular-nums text-slate-950">{prompt.responses}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-sky-500" style={{ width: `${neutral}%` }} />
                </div>
                <span className="w-12 text-right text-xs font-medium text-slate-600">{formatPercent(neutral)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InsightPanel() {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
      <div className="space-y-2">
        {insightActionCards.map((card) => (
          <div key={card.title} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-950">{card.title}</h3>
              <span className={cn("rounded-md border px-2 py-1 text-xs font-medium", priorityStyles[card.priority])}>
                {card.priority}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{card.body}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-950">Next Actions</h3>
        </div>
        <div className="mt-3 space-y-2">
          {nextActionItems.map((item, index) => (
            <div key={item} className="flex gap-2 rounded-lg bg-white p-2 text-xs leading-5 text-slate-700 shadow-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-semibold text-white">
                {index + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OverviewAnalysisDashboard() {
  const neutralShare = parseNumericValue(overviewSummaryMetrics.find((metric) => metric.icon === "neutral")?.value ?? "0");
  const responseMentions = parseNumericValue(
    overviewSummaryMetrics.find((metric) => metric.icon === "competitor")?.value ?? "0"
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Activity className="h-4 w-4" />
              <span>Overview Analytics</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">AI visibility performance</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Citation coverage, response mix, prompt performance, and competitor visibility across GPT, Gemini, and Perplexity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              Static snapshot
            </span> */}
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {formatPercent(neutralShare)} neutral citation share
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-flow-col auto-cols-[minmax(170px,1fr)] gap-4 overflow-x-auto pb-1 xl:grid-flow-row xl:grid-cols-5 xl:overflow-visible xl:pb-0">
        {overviewSummaryMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="LLM volume"
          eyebrow="Platform performance"
          action={<span className="text-xs text-slate-500">Citations vs responses</span>}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -20, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="citations" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="responses" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Citation composition" eyebrow="All platforms">
          <div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[150px_minmax(0,1fr)]">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Neutral", value: neutralShare, color: toneHex.neutral },
                      { name: "Brand", value: 1.3, color: toneHex.brand },
                      { name: "Competitor", value: Math.max(0, 100 - neutralShare - 1.3), color: toneHex.competitor }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={2}
                  >
                    {["neutral", "brand", "competitor"].map((tone) => (
                      <Cell key={tone} fill={toneHex[tone as OverviewTone]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">Neutral Share</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{formatPercent(neutralShare)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">Competitor Mentions</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{responseMentions}</p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Competitor visibility" eyebrow="Citation share">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visibilityChartData} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  width={94}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="share" name="Citation share" fill="#dc2626" radius={[0, 6, 6, 0]} />
                <Bar dataKey="prompts" name="Prompt coverage" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <Panel title="Citation mix by LLM" eyebrow="Distribution">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={llmChartData} margin={{ left: -20, right: 16, top: 6, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="brand" stackId="citations" fill={toneHex.brand} radius={[0, 0, 0, 0]} />
                <Bar dataKey="competitor" stackId="citations" fill={toneHex.competitor} radius={[0, 0, 0, 0]} />
                <Bar dataKey="neutral" stackId="citations" fill={toneHex.neutral} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Prompt citation volume" eyebrow="Top prompt set">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={promptChartData} margin={{ left: -20, right: 16, top: 6, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="prompt" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="citations" name="Citations" fill="#0f172a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="responses" name="Responses" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Panel
          title="LLM analysis"
          eyebrow="Breakdown"
          action={
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-1"><CircleDot className="h-3 w-3 text-emerald-600" /> Brand</span>
              <span className="flex items-center gap-1"><CircleDot className="h-3 w-3 text-red-600" /> Competitor</span>
              <span className="flex items-center gap-1"><CircleDot className="h-3 w-3 text-sky-600" /> Neutral</span>
            </div>
          }
        >
          <LLMPerformanceGrid />
        </Panel>

        <Panel title="Prompt performance table" eyebrow="Query-level visibility">
          <div className="overflow-x-auto">
            <PromptTable />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <Panel title="Competitor notes" eyebrow="Visibility context">
          <div className="grid gap-2 lg:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {competitorVisibilityCards.map((card) => (
              <div key={card.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-950">{card.name}</h3>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm">
                    {card.citationShare} share
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{card.summary}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Insights and next actions" eyebrow="Recommendations">
          <InsightPanel />
        </Panel>
      </div>
    </div>
  );
}
