import type { ProjectDashboard } from "@/lib/cairrot/project-dashboard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export interface KeywordsTopicsPanelProps {
  project: ProjectDashboard;
}

export function KeywordsTopicsPanel({ project }: KeywordsTopicsPanelProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold text-textPrimary">Brand keywords &amp; topics</h2>
      <p className="mt-1 text-sm text-textSecondary">
        Keywords and topics Cairrot uses to track {project.url} across LLM answers.
      </p>
      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Brand keywords</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.keywords.length > 0 ? (
            project.keywords.map((keyword) => (
              <StatusBadge key={keyword} variant="brand">
                {keyword}
              </StatusBadge>
            ))
          ) : (
            <p className="text-sm text-textMuted">No keywords configured in Cairrot.</p>
          )}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Content topics</p>
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
          <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Tracked competitors</p>
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
