/** Cairrot REST paths (prepend CAIRROT_API_BASE_URL). See CAIRROT_API_DISCOVERY.md */

export const CAIRROT_API_PREFIX = "/api/v1";

export function projectPath(projectId: string): string {
  return `${CAIRROT_API_PREFIX}/projects/${encodeURIComponent(projectId)}`;
}

export function projectRunsSearch(projectId: string): string {
  return `${projectPath(projectId)}/runs/search`;
}

export function projectCitationsSearch(projectId: string): string {
  return `${projectPath(projectId)}/pagehits/search`;
}

export function projectResponsesSearch(projectId: string): string {
  return `${projectPath(projectId)}/responses/search`;
}

export function projectPromptsList(projectId: string): string {
  return `${projectPath(projectId)}/prompts/list`;
}
