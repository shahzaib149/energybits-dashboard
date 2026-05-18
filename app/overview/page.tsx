import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCairrotClient } from "@/lib/cairrot/client";
import { getCairrotEnv, isCairrotConfigured } from "@/lib/env";
import { CitationsResponsesCard } from "@/components/overview/CitationsResponsesCard";
import { LLMBreakdown } from "@/components/overview/LLMBreakdown";
import { OverviewHeader } from "@/components/overview/OverviewHeader";
import { PromptsGrid } from "@/components/overview/PromptsGrid";
import { ProjectBanner } from "@/components/overview/ProjectBanner";
import { GeoReadinessPanel } from "@/components/overview/GeoReadinessPanel";
import { SectionHeading } from "@/components/overview/SectionHeading";
import { KeywordsTopicsPanel } from "@/components/overview/KeywordsTopicsPanel";
import { AllPromptsTable } from "@/components/overview/AllPromptsTable";
import { CompetitorsSection, DomainsSection, InsightsSection } from "@/app/overview/_sections";
import { OverviewPageSkeleton, SectionSkeleton } from "@/app/overview/loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function OverviewPage({
  searchParams
}: {
  searchParams: { runId?: string };
}) {
  if (!isCairrotConfigured()) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState
          title="Cairrot is not configured"
          description="Add CAIRROT_API_KEY and CAIRROT_PROJECT_ID to .env.local (see .env.example). CAIRROT_API_BASE_URL defaults to https://api.cairrot.com. Restart the dev server after saving."
        />
      </div>
    );
  }

  const client = getCairrotClient();
  const runIdParam = searchParams.runId;

  try {
    const dashboard = await client.getFullDashboard(runIdParam);
    const { project, run, runs, allPrompts, fetchedAt } = dashboard;

    if (runIdParam && run.runId !== runIdParam) {
      redirect(`/overview?runId=${encodeURIComponent(run.runId)}`);
    }

    const env = getCairrotEnv();
    const exportPayload = {
      project,
      run,
      runs,
      allPrompts,
      fetchedAt,
      source: "Cairrot API",
      verifyUrl: `/api/cairrot/dashboard?runId=${encodeURIComponent(run.runId)}`
    };

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <OverviewHeader
          runId={run.runId}
          createdAt={run.createdAt}
          runs={runs}
          exportPayload={exportPayload}
          fetchedAt={fetchedAt}
          projectUrl={project.url}
        />

        <ProjectBanner project={project} projectIdEnv={env.CAIRROT_PROJECT_ID} />

        <GeoReadinessPanel geo={project.geo} />

        <SectionHeading
          accent="aeo"
          label="AEO · Answer engine visibility"
          title="LLM visibility for this run"
          description="Citations, mentions, and prompt-level results from the selected Cairrot visibility run."
        />

        <Suspense fallback={<OverviewPageSkeleton />}>
          <CitationsResponsesCard totals={run.totals} />
          <LLMBreakdown llms={run.llms} />
          <PromptsGrid prompts={run.prompts} />
        </Suspense>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Suspense fallback={<SectionSkeleton rows={6} />}>
            <DomainsSection runId={run.runId} />
          </Suspense>
          <Suspense fallback={<SectionSkeleton rows={4} />}>
            <CompetitorsSection runId={run.runId} />
          </Suspense>
        </div>

        <Suspense fallback={<SectionSkeleton rows={5} />}>
          <InsightsSection runId={run.runId} brandVariants={run.brandVariants} />
        </Suspense>

        <KeywordsTopicsPanel project={project} />

        <AllPromptsTable prompts={allPrompts} />
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load Cairrot dashboard.";
    const isNoRuns = message.toLowerCase().includes("no prompt runs");

    if (isNoRuns) {
      return (
        <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
          <h1 className="text-2xl font-semibold text-textPrimary">Overview</h1>
          <EmptyState
            title="No visibility runs yet"
            description="Create a project in Cairrot and run your first prompt check. Data will appear here automatically."
            actionLabel="Open Cairrot"
            actionHref="https://cairrot.com"
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title="Unable to load overview" message={message} statusCode={500} />
      </div>
    );
  }
}
