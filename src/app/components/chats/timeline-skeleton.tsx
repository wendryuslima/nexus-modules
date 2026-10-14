import { Skeleton } from "@/components/ui/skeleton";

const TimelineSkeleton = () => (
  <div className="flex w-full flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8" aria-label="Carregando mensagens">
    <Skeleton className="mx-auto h-4 w-20" />
    <Skeleton className="h-16 w-2/3 max-w-md rounded-md" />
    <Skeleton className="ml-auto h-16 w-2/3 max-w-md rounded-md" />
  </div>
);

export { TimelineSkeleton };
