import { getCairrotClient } from "@/lib/cairrot/client";
import { CairrotAPIError } from "@/lib/cairrot/errors";
import { buildRecommendedActions } from "@/lib/cairrot/insights";
import { CompetitorVisibility } from "@/components/overview/CompetitorVisibility";
import { InsightsPanel } from "@/components/overview/InsightsPanel";
import { NeutralDomainsTable } from "@/components/overview/NeutralDomainsTable";
import { PerformanceTrendChart } from "@/components/overview/PerformanceTrendChart";
import { ErrorState } from "@/components/ui/ErrorState";

export async function DomainsSection({ runId }: { runId: string }) {
  try {
    const domains = await getCairrotClient().getNeutralDomains(runId, 25);
    return <NeutralDomainsTable domains={domains} />;
  } catch (error) {
    const status = error instanceof CairrotAPIError ? error.status : undefined;
    return <ErrorState message="Failed to load neutral domains." statusCode={status} />;
  }
}

export async function CompetitorsSection({ runId }: { runId: string }) {
  try {
    const competitors = await getCairrotClient().getCompetitorVisibility(runId);
    return <CompetitorVisibility competitors={competitors} />;
  } catch (error) {
    const status = error instanceof CairrotAPIError ? error.status : undefined;
    return <ErrorState message="Failed to load competitor visibility." statusCode={status} />;
  }
}

export async function PerformanceTrendSection() {
  try {
    const runs = await getCairrotClient().getPerformanceTrend(8);
    return <PerformanceTrendChart runs={runs} />;
  } catch (error) {
    const status = error instanceof CairrotAPIError ? error.status : undefined;
    return <ErrorState message="Failed to load performance trend." statusCode={status} />;
  }
}

export async function InsightsSection({ runId, brandVariants }: { runId: string; brandVariants: string[] }) {
  try {
    const client = getCairrotClient();
    const [insights, run] = await Promise.all([client.getInsights(runId), client.getRun(runId)]);
    const recommendedActions = buildRecommendedActions(run);
    return <InsightsPanel insights={insights} recommendedActions={recommendedActions} brandVariants={brandVariants} />;
  } catch (error) {
    const status = error instanceof CairrotAPIError ? error.status : undefined;
    return <ErrorState message="Failed to load insights." statusCode={status} />;
  }
}
