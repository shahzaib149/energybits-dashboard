import { StatusBadge } from "@/components/ui/StatusBadge";

export interface BrandVariantsBadgesProps {
  variants: string[];
}

export function BrandVariantsBadges({ variants }: BrandVariantsBadgesProps) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-textMuted">Brand variants spotted</span>
      {variants.map((variant) => (
        <StatusBadge key={variant} variant="brand">
          {variant}
        </StatusBadge>
      ))}
    </div>
  );
}
