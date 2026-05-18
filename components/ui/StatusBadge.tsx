import { cn } from "@/lib/utils/cn";

export interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "warning" | "muted";
}

const variants = {
  default: "border-border bg-surfaceElevated text-textSecondary",
  brand: "border-brand/30 bg-brand/10 text-brand",
  warning: "border-warning/30 bg-warning/10 text-warning",
  muted: "border-border bg-surface text-textMuted"
};

export function StatusBadge({ children, variant = "default" }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}
