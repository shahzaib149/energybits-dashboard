import type { PromptResult } from "@/lib/cairrot/types";
import { COPY } from "@/lib/copy";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PromptCard } from "@/components/overview/PromptCard";

export interface PromptsGridProps {
  prompts: PromptResult[];
}

export function PromptsGrid({ prompts }: PromptsGridProps) {
  const copy = COPY.overview.promptsGrid;

  if (prompts.length === 0) {
    return (
      <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
    );
  }

  return (
    <section>
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="grid gap-4 lg:grid-cols-2">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.promptId} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}
