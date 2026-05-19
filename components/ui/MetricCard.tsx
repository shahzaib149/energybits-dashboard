import type { LucideIcon } from "lucide-react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { cn } from "@/lib/utils/cn";

export interface MetricCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  description?: string;
  tooltip?: string;
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, hint, description, tooltip, className }: MetricCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">{label}</p>
            {tooltip ? <InfoTooltip content={tooltip} label={`About ${label}`} /> : null}
          </div>
          <p className="mt-1 text-3xl font-bold tabular-nums text-textPrimary">{value}</p>
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
