import { Skeleton } from "@/components/ui/Skeleton";

export default function KlaviyoLoading() {
  return (
    <div className="overview-theme mx-auto max-w-[1400px] space-y-8 p-6 lg:p-8">
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-lg" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
