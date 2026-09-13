import { Skeleton } from "@/components/ui/skeleton";

const PeopleListSkeleton = () => {
  return (
    <div
      className="divide-y divide-border overflow-hidden rounded-xl border bg-card"
      aria-label="Carregando pessoas"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4 sm:px-5">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52 max-w-full" />
          </div>
          <Skeleton className="hidden h-3 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
};

export { PeopleListSkeleton };
