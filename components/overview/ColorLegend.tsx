import { COPY } from "@/lib/copy";

export function ColorLegend() {
  const legend = COPY.overview.colorLegend;

  return (
    <div className="rounded-xl border border-border/60 bg-surfaceElevated px-4 py-3 text-xs text-textSecondary">
      <p className="font-medium text-textPrimary">{legend.title}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        <LegendItem colorClass="bg-brand" label={legend.brand} />
        <LegendItem colorClass="bg-competitor" label={legend.competitor} />
        <LegendItem colorClass="bg-neutral" label={legend.neutral} />
        <LegendItem colorClass="bg-warning" label={legend.both} />
        <LegendItem colorClass="bg-textMuted" label={legend.neither} />
      </div>
    </div>
  );
}

function LegendItem({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} aria-hidden />
      {label}
    </span>
  );
}
