import { HubOverviewSkeleton } from "@/components/overview/OverviewSkeletons";

export default function AuditLogLoading() {
  return (
    <div className="overview-theme mx-auto max-w-[1400px] space-y-8 p-6 lg:p-8">
      <HubOverviewSkeleton />
    </div>
  );
}
