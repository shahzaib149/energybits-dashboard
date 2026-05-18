import type { PromptResult } from "@/lib/cairrot/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { PromptCard } from "@/components/overview/PromptCard";

export interface PromptsGridProps {
  prompts: PromptResult[];
}

export function PromptsGrid({ prompts }: PromptsGridProps) {
  if (prompts.length === 0) {
    return (
      <EmptyState
        title="No prompts in this run"
        description="Add prompts in Cairrot and run a visibility check to populate this section."
        actionLabel="Open Cairrot"
        actionHref="https://cairrot.com"
      />
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-textSecondary">Prompt performance</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.promptId} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}
