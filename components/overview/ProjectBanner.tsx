import { Globe, Hash } from "lucide-react";
import type { ProjectDashboard } from "@/lib/cairrot/project-dashboard";
import { formatDateTime } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

export interface ProjectBannerProps {
  project: ProjectDashboard;
  projectIdEnv: string;
}

export function ProjectBanner({ project, projectIdEnv }: ProjectBannerProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Cairrot project</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-textPrimary">
              <Globe className="h-5 w-5 text-brand" />
              {project.url}
            </h2>
            <StatusBadge variant="brand">{project.planCode}</StatusBadge>
            {project.lastRunStatus ? (
              <StatusBadge variant={project.lastRunStatus === "success" ? "brand" : "warning"}>
                Last run · {project.lastRunStatus}
              </StatusBadge>
            ) : null}
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-textSecondary">{project.description}</p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-textMuted">
            <Hash className="h-3.5 w-3.5" />
            <span>Project ID: {project.id}</span>
            <span className="text-border">|</span>
            <span>Env project: {projectIdEnv}</span>
          </p>
        </div>
        <div className="grid shrink-0 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg border border-border/60 bg-surfaceElevated px-4 py-3">
            <p className="text-xs text-textMuted">Last Cairrot run</p>
            <p className="mt-1 font-medium text-textPrimary">
              {project.lastRunAt ? formatDateTime(project.lastRunAt) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-surfaceElevated px-4 py-3">
            <p className="text-xs text-textMuted">Next scheduled run</p>
            <p className="mt-1 font-medium text-textPrimary">
              {project.nextRunAt ? formatDateTime(project.nextRunAt) : "—"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
