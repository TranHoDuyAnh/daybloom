import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-64 rounded-xl" />
        <Skeleton className="h-9 w-52 rounded-xl" />
      </div>
      <Skeleton className="h-[70dvh] w-full rounded-2xl" />
    </div>
  );
}
