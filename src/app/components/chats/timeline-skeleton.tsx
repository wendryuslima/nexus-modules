import { Skeleton } from "@/components/ui/skeleton";

const TimelineSkeleton = () => (
  <div
    className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-5 py-8"
    aria-label="Carregando mensagens"
  >
    <Skeleton className="mx-auto h-4 w-20" />
    <div className="flex gap-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="w-2/3 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    </div>
    <div className="flex gap-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="w-1/2 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  </div>
);

export { TimelineSkeleton };
