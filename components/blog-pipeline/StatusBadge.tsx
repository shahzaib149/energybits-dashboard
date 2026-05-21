import type { BlogStatus } from "@/lib/airtable/blog-pipeline";
import { statusColors } from "@/lib/airtable/blog-pipeline";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: BlogStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-medium", statusColors[status])}>
      {status}
    </span>
  );
}
