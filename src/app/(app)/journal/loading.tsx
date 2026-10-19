import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-[20rem_minmax(0,1fr)]">
      <Skeleton className="h-[70dvh] w-full rounded-2xl" />
      <Skeleton className="h-[70dvh] w-full rounded-2xl" />
    </div>
  );
}
