import type { Metadata } from "next";
import { getCairrotClient } from "@/lib/cairrot/client";
import { getCairrotEnv, isCairrotConfigured } from "@/lib/env";
import { COPY } from "@/lib/copy";
import { GeoReadinessPanel } from "@/components/overview/GeoReadinessPanel";
import { GeoScoreTrendChart } from "@/components/overview/GeoScoreTrendChart";
import { KeywordsTopicsPanel } from "@/components/overview/KeywordsTopicsPanel";
import { ProjectBanner } from "@/components/overview/ProjectBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export const metadata: Metadata = {
  title: COPY.geoAnalytics.meta.title,
  description: COPY.geoAnalytics.meta.description
};

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function GEOAnalyticsPage() {
  if (!isCairrotConfigured()) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState
          title={COPY.geoAnalytics.notConfigured.title}
          description={COPY.geoAnalytics.notConfigured.description}
        />
      </div>
    );
  }

  try {
    const dashboard = await getCairrotClient().getFullDashboard();
    const { project } = dashboard;
    const env = getCairrotEnv();
    const geoCopy = COPY.overview.geo;

    const sortedCategories = [...project.geo.categories].sort((a, b) => b.score - a.score);
    const focusAreas = [...project.geo.categories].sort((a, b) => a.score - b.score).slice(0, 2);

    return (
      <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-sky-400">{COPY.geoAnalytics.header.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold text-textPrimary lg:text-3xl">{COPY.geoAnalytics.header.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-textSecondary">{COPY.geoAnalytics.header.subtitle}</p>
        </header>

        <ProjectBanner project={project} projectIdEnv={env.CAIRROT_PROJECT_ID} />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-textPrimary">Performance Trends</h2>
          <GeoScoreTrendChart geo={project.geo} />
        </div>

        <GeoReadinessPanel geo={project.geo} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Strongest areas</p>
            <h2 className="mt-1 text-lg font-semibold text-textPrimary">What&apos;s working well</h2>
            <div className="mt-5 space-y-4">
              {sortedCategories.slice(0, 2).map((category) => (
                <div key={category.name} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <ProgressBar label={category.name} percent={category.score} tone="brand" />
                  </div>
                  {geoCopy.categories[category.name] ? (
                    <InfoTooltip content={geoCopy.categories[category.name]} label={`About ${category.name}`} />
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-400/90">Focus areas</p>
            <h2 className="mt-1 text-lg font-semibold text-textPrimary">Where to improve next</h2>
            <p className="mt-1 text-sm text-textSecondary">{COPY.geoAnalytics.focusSubtitle}</p>
            <div className="mt-5 space-y-4">
              {focusAreas.map((category) => (
                <div key={category.name} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <ProgressBar label={category.name} percent={category.score} tone="neutral" />
                  </div>
                  {geoCopy.categories[category.name] ? (
                    <InfoTooltip content={geoCopy.categories[category.name]} label={`About ${category.name}`} />
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <KeywordsTopicsPanel project={project} />
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : COPY.geoAnalytics.loadError;
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <ErrorState title={COPY.geoAnalytics.loadError} message={message} statusCode={500} />
      </div>
    );
  }
}
