import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <Inbox className="mb-3 h-8 w-8 text-textMuted" />
      <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-textSecondary">{description}</p>
      {actionLabel && actionHref ? (
        <a
          href={actionHref}
          target="_blank"
          rel="noreferrer"
          className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-background hover:bg-brandHover"
        >
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}
