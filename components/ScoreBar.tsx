import { cn } from "@/lib/utils";

interface ScoreBarProps {
  value?: number | null;
}

export function ScoreBar({ value }: ScoreBarProps) {
  const score = Math.max(0, Math.min(100, value ?? 0));
  const tone =
    score <= 40
      ? "bg-rose-500"
      : score <= 70
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="min-w-28">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>Score</span>
        <span>{score}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100">
        <div className={cn("h-2.5 rounded-full transition-all", tone)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
