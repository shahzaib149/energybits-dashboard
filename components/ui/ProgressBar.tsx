import { cn } from "@/lib/utils/cn";

export type ProgressTone = "brand" | "competitor" | "neutral" | "both" | "neither";

const toneClass: Record<ProgressTone, string> = {
  brand: "bg-brand",
  competitor: "bg-competitor",
  neutral: "bg-neutral",
  both: "bg-warning",
  neither: "bg-textMuted"
};

export interface ProgressBarProps {
  label: string;
  percent: number;
  tone: ProgressTone;
}

export function ProgressBar({ label, percent, tone }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, percent));

  return (
    <div className="grid grid-cols-[minmax(72px,0.9fr)_1fr_auto] items-center gap-2 text-xs">
      <span className="truncate text-textSecondary" title={label}>
        {label}
      </span>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", toneClass[tone])}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-12 text-right font-medium tabular-nums text-textPrimary">{width.toFixed(1)}%</span>
    </div>
  );
}
