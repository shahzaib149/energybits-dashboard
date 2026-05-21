"use client";

import type { ProjectPrompt } from "@/lib/cairrot/project-dashboard";
import { COPY } from "@/lib/copy";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { staticFilename } from "@/lib/csv/columns";
import type { CSVColumn } from "@/lib/csv/build";

const allPromptColumns: CSVColumn<ProjectPrompt>[] = [
  { key: "text", label: "Question" },
  { key: "topic", label: "Category" },
  { key: "enabled", label: "Active", format: (v) => (v ? "Yes" : "No") },
  { key: "buyerPersona", label: "Audience" }
];

export interface AllPromptsTableProps {
  prompts: ProjectPrompt[];
}

export function AllPromptsTable({ prompts }: AllPromptsTableProps) {
  const enabledCount = prompts.filter((p) => p.enabled).length;
  const copy = COPY.overview.allPrompts;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={copy.title}
        subtitle={copy.subtitle(enabledCount, prompts.length)}
        actions={
          <CSVExportButton
            data={prompts}
            columns={allPromptColumns}
            filename={staticFilename("aeo-all-prompts")}
            resourceType="aeo-all-prompts"
          />
        }
      />
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[minmax(0,2fr)_140px_100px_minmax(140px,1fr)] gap-3 border-b border-border bg-surfaceElevated px-3 py-2 text-[11px] font-medium uppercase text-textMuted">
          <span>{copy.columns.question}</span>
          <span>{copy.columns.category}</span>
          <span>{copy.columns.status}</span>
          <span>{copy.columns.audience}</span>
        </div>
        <div className="max-h-[420px] divide-y divide-border overflow-y-auto">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="grid grid-cols-[minmax(0,2fr)_140px_100px_minmax(140px,1fr)] gap-3 px-3 py-3 text-sm"
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
              <span className="text-xs text-textMuted" title={prompt.buyerPersona ?? undefined}>
                {prompt.buyerPersona ?? "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
