import { SectionSkeleton } from "@/components/overview/OverviewSkeletons";
import { Skeleton } from "@/components/ui/Skeleton";

export default function GEOAnalyticsLoading() {
  return (
    <div className="overview-theme mx-auto max-w-[1400px] space-y-8 p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <SectionSkeleton rows={5} />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionSkeleton rows={3} />
        <SectionSkeleton rows={3} />
      </div>
    </div>
  );
}
