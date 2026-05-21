import type { Metadata } from "next";
import { Suspense } from "react";
import { COPY } from "@/lib/copy";
import { getServerUser } from "@/lib/auth/getServerUser";
import { fetchOverviewHubData } from "@/lib/overview/summary";
import { parseDateRange } from "@/lib/date-range/parse";
import {
  HealthDashboard,
  HubOverviewHeader,
  QuickChannelLinks
} from "@/components/overview-hub/HealthDashboard";
import { TopActionsPanel } from "@/components/overview-hub/TopActionsPanel";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

export const metadata: Metadata = {
  title: COPY.hub.meta.title,
  description: COPY.hub.meta.description
};

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function OverviewPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const { range: dateRange, invalid: showInvalidToast } = parseDateRange(searchParams);
  const [hub, user] = await Promise.all([
    fetchOverviewHubData(undefined, dateRange),
    getServerUser()
  ]);

  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
      <HubOverviewHeader
        dateRangePicker={
          <Suspense fallback={<div className="h-8 w-28 animate-pulse rounded-full bg-surfaceElevated" />}>
            <DateRangePicker current={dateRange} showInvalidToast={showInvalidToast} />
          </Suspense>
        }
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <TopActionsPanel userRole={user?.role ?? null} dateRange={dateRange} />
      </div>
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
