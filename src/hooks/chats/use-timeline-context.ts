import { useInfiniteQuery } from "@tanstack/react-query";
import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { listTimeline } from "@/services/chats/list-timeline";
import type { ListTimelineParams } from "@/types/chats/timeline-dto";


const useTimelineContext = (chatId: string, anchor: number | undefined) => useInfiniteQuery({
  queryKey: chatsQueryKeys.history(chatId, anchor),
  queryFn: ({ pageParam, signal }) => listTimeline(chatId, pageParam, signal),
  initialPageParam: { pageSize: 51, order: "sequence", aroundSequence: anchor } as ListTimelineParams,
  getNextPageParam: ({ data }): ListTimelineParams | undefined => {
    const oldest = data.items[0];
    if (!data.pagination.hasOlder || !oldest) return undefined;
    return { pageSize: 50, order: "sequence", beforeSequence: oldest.sequence };
  },
  getPreviousPageParam: ({ data }): ListTimelineParams | undefined => {
    const newest = data.items.at(-1);
    if (!data.pagination.hasNewer || !newest) return undefined;
    return { pageSize: 50, afterSequence: newest.sequence };
  },
  enabled: anchor !== undefined,
  maxPages: 8,
  gcTime: 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
});

export { useTimelineContext };
