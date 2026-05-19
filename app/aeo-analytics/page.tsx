import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCairrotClient } from "@/lib/cairrot/client";
import { getCairrotEnv, isCairrotConfigured } from "@/lib/env";
import { COPY } from "@/lib/copy";
import { AtAGlanceCard } from "@/components/overview/AtAGlanceCard";
import { CitationsResponsesCard } from "@/components/overview/CitationsResponsesCard";
import { LLMBreakdown } from "@/components/overview/LLMBreakdown";
import { OverviewHeader } from "@/components/overview/OverviewHeader";
import { PromptsGrid } from "@/components/overview/PromptsGrid";
import { ProjectBanner } from "@/components/overview/ProjectBanner";
import { SectionHeading } from "@/components/overview/SectionHeading";
import { KeywordsTopicsPanel } from "@/components/overview/KeywordsTopicsPanel";
import { AllPromptsTable } from "@/components/overview/AllPromptsTable";
import { CompetitorsSection, DomainsSection, InsightsSection } from "@/app/aeo-analytics/_sections";
import { OverviewPageSkeleton, SectionSkeleton } from "@/components/overview/OverviewSkeletons";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: COPY.aeoAnalytics.meta.title,
  description: COPY.aeoAnalytics.meta.description
};

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function AEOAnalyticsPage({
  searchParams
}: {
  searchParams: { runId?: string };
}) {
  if (!isCairrotConfigured()) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState
          title={COPY.aeoAnalytics.notConfigured.title}
          description={COPY.aeoAnalytics.notConfigured.description}
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
      redirect(`/aeo-analytics?runId=${encodeURIComponent(run.runId)}`);
    }

    const env = getCairrotEnv();
    const exportPayload = {
      project,
      run,
      runs,
      allPrompts,
      fetchedAt,
      source: "ENERGYbits AEO Analytics",
      verifyUrl: `/api/cairrot/dashboard?runId=${encodeURIComponent(run.runId)}`
    };

    const aeoCopy = COPY.overview.aeo;

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <OverviewHeader
          runId={run.runId}
          createdAt={run.createdAt}
          runs={runs}
          exportPayload={exportPayload}
          fetchedAt={fetchedAt}
          projectUrl={project.url}
          basePath="/aeo-analytics"
          eyebrow={COPY.aeoAnalytics.header.eyebrow}
          title={COPY.aeoAnalytics.header.title}
        />

        <ProjectBanner project={project} projectIdEnv={env.CAIRROT_PROJECT_ID} />

        <SectionHeading
          accent="aeo"
          label={aeoCopy.sectionLabel}
          title={aeoCopy.sectionTitle}
          description={aeoCopy.sectionDescription}
        />

        <AtAGlanceCard run={run} />

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
    const message = err instanceof Error ? err.message : COPY.aeoAnalytics.loadError;
    const isNoRuns = message.toLowerCase().includes("no prompt runs");

    if (isNoRuns) {
      return (
        <div className="overview-theme mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
          <h1 className="text-2xl font-semibold text-textPrimary">{COPY.aeoAnalytics.header.title}</h1>
          <EmptyState title={COPY.overview.noRuns.title} description={COPY.overview.noRuns.description} />
        </div>
      );
    }

    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.aeoAnalytics.loadError} message={message} statusCode={500} />
      </div>
    );
  }
}
