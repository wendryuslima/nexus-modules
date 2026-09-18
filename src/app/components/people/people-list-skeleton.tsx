import { Skeleton } from "@/components/ui/skeleton";

const PeopleListSkeleton = () => (
  <div className="space-y-1" aria-label="Carregando mensagens diretas">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="flex items-center gap-2 px-2 py-1.5">
        <Skeleton className="size-7 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-40 max-w-full" />
        </div>
      </div>
    ))}
  </div>
);

export { PeopleListSkeleton };
