"use client";

import type { PromptResult } from "@/lib/cairrot/types";
import { COPY } from "@/lib/copy";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { staticFilename } from "@/lib/csv/columns";
import type { CSVColumn } from "@/lib/csv/build";
import { PromptCard } from "@/components/overview/PromptCard";

const promptColumns: CSVColumn<PromptResult>[] = [
  { key: "text", label: "Prompt" },
  { key: "citationsCount", label: "Citations" },
  { key: "responsesCount", label: "Responses" },
  {
    key: "citationShares",
    label: "Brand Citation %",
    format: (v) => String((v as PromptResult["citationShares"]).brandPct)
  }
];

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
      <SectionHeaderRow
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <CSVExportButton
            data={prompts}
            columns={promptColumns}
            filename={staticFilename("aeo-prompts-grid")}
            resourceType="aeo-prompts-grid"
          />
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.promptId} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}
