import { Skeleton } from "@/components/ui/skeleton";

const ChatsListSkeleton = () => (
  <div role="status" aria-label="Carregando conversas" className="space-y-1">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="flex items-center gap-3 px-3 py-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-36 max-w-full" />
        </div>
        <Skeleton className="h-2.5 w-7 self-start" />
      </div>
    ))}
  </div>
);

export { ChatsListSkeleton };
