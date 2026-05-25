import { TableSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] p-3 sm:p-6 lg:p-8">
      <TableSkeleton />
    </div>
  );
}
