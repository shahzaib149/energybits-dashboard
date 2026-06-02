"use client";

import type { BlogStatus } from "@/lib/airtable/blog-pipeline";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

const ALL_STATUSES: (BlogStatus | "all")[] = [
  "all",
  "Creating",
  "Ready",
  "Draft Generated",
  "Needs Review",
  "Revision Needed",
  "Approved",
  "Image Ready"
];

export function PipelineStatusFilters({
  value,
  onChange
}: {
  value: BlogStatus | "all";
  onChange: (v: BlogStatus | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition",
            value === status ? "bg-brand/20 text-brand" : "bg-surfaceElevated text-textMuted hover:text-textPrimary"
          )}
        >
          {status === "all" ? COPY.blogPipeline.filters.all : status}
        </button>
      ))}
    </div>
  );
}

export function StatusCountPills({ counts }: { counts: Record<string, number> }) {
  const copy = COPY.blogPipeline;
  const text = copy.statusCounts
    .replace("{creating}", String(counts.creating ?? 0))
    .replace("{ready}", String(counts.ready ?? 0))
    .replace("{drafting}", String(counts.drafting ?? 0))
    .replace("{review}", String(counts.review ?? 0))
    .replace("{published}", String(counts.published ?? 0));

  return <p className="text-xs text-textMuted">{text}</p>;
}
