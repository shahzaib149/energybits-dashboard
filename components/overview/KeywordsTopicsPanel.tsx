import type { ProjectDashboard } from "@/lib/cairrot/project-dashboard";
import { COPY } from "@/lib/copy";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionTitle } from "@/components/ui/SectionTitle";

export interface KeywordsTopicsPanelProps {
  project: ProjectDashboard;
}

export function KeywordsTopicsPanel({ project }: KeywordsTopicsPanelProps) {
  const copy = COPY.overview.keywordsTopics;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} className="mb-6" />
      <div className="mt-2">
        <p className="text-xs font-medium uppercase tracking-wide text-textMuted">{copy.brandKeywords}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.keywords.length > 0 ? (
            project.keywords.map((keyword) => (
              <StatusBadge key={keyword} variant="brand">
                {keyword}
              </StatusBadge>
            ))
          ) : (
            <p className="text-sm text-textMuted">{copy.noKeywords}</p>
          )}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-textMuted">{copy.contentTopics}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.topics.map((topic) => (
            <StatusBadge key={topic} variant="muted">
              {topic}
            </StatusBadge>
          ))}
        </div>
      </div>
      {project.competitors.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-textMuted">{copy.trackedCompetitors}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.competitors.map((competitor) => (
              <StatusBadge key={competitor.name} variant="default">
                {competitor.name}
              </StatusBadge>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
