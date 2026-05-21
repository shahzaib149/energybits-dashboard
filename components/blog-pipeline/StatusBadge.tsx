import type { BlogStatus } from "@/lib/airtable/blog-pipeline";
import { statusColors } from "@/lib/airtable/blog-pipeline";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, processing }: { status: BlogStatus; processing?: boolean }) {
  const label = processing ? "Creating" : status;
  const colorClass = processing ? statusColors.Creating : statusColors[status];

  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-medium", colorClass)}>
      {label}
    </span>
  );
}
