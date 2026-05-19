import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { cn } from "@/lib/utils/cn";

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  tooltip?: string;
  className?: string;
  titleClassName?: string;
}

export function SectionTitle({ title, subtitle, tooltip, className, titleClassName }: SectionTitleProps) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center gap-2">
        <h2 className={cn("text-sm font-semibold text-textPrimary", titleClassName)}>{title}</h2>
        {tooltip ? <InfoTooltip content={tooltip} label={`About ${title}`} /> : null}
      </div>
      {subtitle ? <p className="mt-1 text-sm text-textSecondary">{subtitle}</p> : null}
    </div>
  );
}
