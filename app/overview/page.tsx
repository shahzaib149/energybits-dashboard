import type { Metadata } from "next";
import { COPY } from "@/lib/copy";
import { fetchOverviewHubData } from "@/lib/overview/summary";
import {
  HealthDashboard,
  HubOverviewHeader,
  QuickChannelLinks
} from "@/components/overview-hub/HealthDashboard";

export const metadata: Metadata = {
  title: COPY.hub.meta.title,
  description: COPY.hub.meta.description
};

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function OverviewPage() {
  const hub = await fetchOverviewHubData();

  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
      <HubOverviewHeader />
      <HealthDashboard
        overallScore={hub.overallScore}
        standingLabel={hub.standingLabel}
        healthScores={hub.healthScores}
        projectUrl={hub.projectUrl}
      />
      <QuickChannelLinks channels={hub.channels} />
    </div>
  );
}
