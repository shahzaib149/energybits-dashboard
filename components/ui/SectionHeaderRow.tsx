import type { ReactNode } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils/cn";

export interface SectionHeaderRowProps {
  title: string;
  subtitle?: string;
  tooltip?: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeaderRow({ title, subtitle, tooltip, actions, className }: SectionHeaderRowProps) {
  return (
    <div className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <SectionTitle title={title} subtitle={subtitle} tooltip={tooltip} className="mb-0" />
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
