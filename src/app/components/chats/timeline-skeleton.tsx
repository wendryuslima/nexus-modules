import { Skeleton } from "@/components/ui/skeleton";

const TimelineSkeleton = () => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8" aria-label="Carregando mensagens">
    <Skeleton className="mx-auto h-4 w-20" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-16 w-2/3 rounded-xl" />
    </div>
    <div className="flex flex-col items-end space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-12 w-1/2 rounded-xl" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-20 w-3/4 rounded-xl" />
    </div>
  </div>
);

export { TimelineSkeleton };
