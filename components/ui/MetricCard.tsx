import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { cn } from "@/lib/utils/cn";

export interface MetricDeltaDisplay {
  value: string;
  direction: "up" | "down" | "flat";
  positive?: boolean;
}

export interface MetricCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  description?: string;
  tooltip?: string;
  className?: string;
  delta?: MetricDeltaDisplay;
}

export function MetricCard({ label, value, icon: Icon, hint, description, tooltip, className, delta }: MetricCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">{label}</p>
            {tooltip ? <InfoTooltip content={tooltip} label={`About ${label}`} /> : null}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-3xl font-bold tabular-nums text-textPrimary">{value}</p>
            {delta ? <DeltaBadge delta={delta} /> : null}
          </div>
          {hint ? <p className="mt-1 text-xs text-textMuted">{hint}</p> : null}
          {description ? <p className="mt-2 text-xs leading-relaxed text-textMuted">{description}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surfaceElevated text-textSecondary">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: MetricDeltaDisplay }) {
  const isPositive = delta.positive ?? (delta.direction === "up");
  const colorClass =
    delta.direction === "flat"
      ? "text-textMuted bg-surfaceElevated"
      : isPositive
        ? "text-emerald-400 bg-emerald-400/10"
        : "text-red-400 bg-red-400/10";

  const DeltaIcon =
    delta.direction === "up" ? ArrowUp : delta.direction === "down" ? ArrowDown : Minus;

  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold", colorClass)}>
      <DeltaIcon className="h-2.5 w-2.5" />
      {delta.value}
    </span>
  );
}
