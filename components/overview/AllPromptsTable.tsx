import type { ProjectPrompt } from "@/lib/cairrot/project-dashboard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export interface AllPromptsTableProps {
  prompts: ProjectPrompt[];
}

export function AllPromptsTable({ prompts }: AllPromptsTableProps) {
  const enabledCount = prompts.filter((p) => p.enabled).length;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary">All prompts in Cairrot</h2>
          <p className="mt-1 text-sm text-textSecondary">
            {enabledCount} active of {prompts.length} prompts used for visibility checks.
          </p>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_140px_100px_120px] gap-3 border-b border-border bg-surfaceElevated px-3 py-2 text-[11px] font-medium uppercase text-textMuted">
          <span>Prompt</span>
          <span>Topic</span>
          <span>Status</span>
          <span>Buyer persona</span>
        </div>
        <div className="max-h-[420px] divide-y divide-border overflow-y-auto">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="grid grid-cols-[1fr_140px_100px_120px] gap-3 px-3 py-3 text-sm"
            >
              <p className="line-clamp-2 font-medium text-textPrimary">{prompt.text}</p>
              <span className="truncate text-textSecondary" title={prompt.topic}>
                {prompt.topic}
              </span>
              <span>
                <StatusBadge variant={prompt.enabled ? "brand" : "muted"}>
                  {prompt.enabled ? "Active" : "Off"}
                </StatusBadge>
              </span>
              <span className="truncate text-xs text-textMuted">{prompt.buyerPersona ?? "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
