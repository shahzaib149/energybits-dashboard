import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AnalyticsChannelSummary } from "@/lib/overview/summary";
import { cn } from "@/lib/utils";

const accentStyles = {
  brand: {
    border: "border-brand/30 hover:border-brand/50",
    badge: "text-brand",
    stat: "text-brand"
  },
  sky: {
    border: "border-sky-500/30 hover:border-sky-500/50",
    badge: "text-sky-400",
    stat: "text-sky-400"
  },
  green: {
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    badge: "text-emerald-400",
    stat: "text-emerald-400"
  },
  amber: {
    border: "border-amber-500/30 hover:border-amber-500/50",
    badge: "text-amber-400",
    stat: "text-amber-400"
  }
};

export function HubOverviewHeader({ projectUrl }: { projectUrl: string | null }) {
  return (
    <header>
      <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Dashboard</p>
      <h1 className="mt-1 text-2xl font-semibold text-textPrimary lg:text-3xl">Overview</h1>
      <p className="mt-1 max-w-2xl text-sm text-textSecondary">
        Your command center for ENERGYbits performance across AI visibility, site readiness, organic search, and paid
        ads.
        {projectUrl ? (
          <>
            {" "}
            Tracking <span className="font-medium text-textPrimary">{projectUrl}</span>.
          </>
        ) : null}
      </p>
    </header>
  );
}

export function AnalyticsChannelGrid({ channels }: { channels: AnalyticsChannelSummary[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {channels.map((channel) => (
        <AnalyticsChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  );
}

function AnalyticsChannelCard({ channel }: { channel: AnalyticsChannelSummary }) {
  const styles = accentStyles[channel.accent];

  return (
    <Link
      href={channel.href}
      className={cn(
        "group flex flex-col rounded-xl border bg-surface p-6 transition hover:bg-surfaceElevated",
        styles.border,
        !channel.configured && "opacity-90"
      )}
    >
      <p className={cn("text-xs font-medium uppercase tracking-wide", styles.badge)}>{channel.headline}</p>
      <p className="mt-3 text-sm leading-relaxed text-textSecondary">{channel.narrative}</p>

      {channel.stats.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
          {channel.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-[10px] font-medium uppercase tracking-wide text-textMuted">{stat.label}</p>
              <p className={cn("mt-0.5 text-lg font-bold tabular-nums text-textPrimary", styles.stat)}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-textMuted">Not connected yet</p>
      )}

      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-textSecondary group-hover:text-textPrimary">
        View full analytics
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function ExecutiveSummary({ narrative }: { narrative: string | null }) {
  if (!narrative) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">Executive summary</p>
      <p className="mt-3 text-base leading-relaxed text-textPrimary">{narrative}</p>
      <p className="mt-3 text-sm text-textMuted">
        Dive into each channel below for charts, tables, and recommended actions.
      </p>
    </section>
  );
}
