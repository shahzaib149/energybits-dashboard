import { OverviewPageSkeleton } from "@/components/overview/OverviewSkeletons";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AEOAnalyticsLoading() {
  return (
    <div className="overview-theme mx-auto max-w-[1400px] space-y-8 p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-4 w-56" />
      </div>
      <OverviewPageSkeleton />
    </div>
  );
}
