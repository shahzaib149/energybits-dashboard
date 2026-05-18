export interface SectionHeadingProps {
  label: string;
  title: string;
  description?: string;
  accent?: "aeo" | "geo" | "neutral";
}

const accentClass = {
  aeo: "text-brand",
  geo: "text-sky-400",
  neutral: "text-textSecondary"
};

export function SectionHeading({ label, title, description, accent = "neutral" }: SectionHeadingProps) {
  return (
    <div className="border-b border-border pb-3">
      <p className={`text-xs font-medium uppercase tracking-wide ${accentClass[accent]}`}>{label}</p>
      <h2 className="mt-1 text-xl font-semibold text-textPrimary">{title}</h2>
      {description ? <p className="mt-1 text-sm text-textSecondary">{description}</p> : null}
    </div>
  );
}
