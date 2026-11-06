import { useInfiniteQuery } from "@tanstack/react-query";
import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { listTimeline } from "@/services/chats/list-timeline";
import type { ListTimelineParams } from "@/types/chats/timeline-dto";

const useMessageSearch = (chatId: string, query: string) => useInfiniteQuery({
  queryKey: chatsQueryKeys.messageSearch(chatId, query),
  queryFn: ({ pageParam, signal }) => listTimeline(chatId, pageParam, signal),
  initialPageParam: { pageSize: 20, order: "sequence", query } as ListTimelineParams,
  getNextPageParam: ({ data }): ListTimelineParams | undefined => {
    if (!data.pagination.hasNext || data.pagination.nextBeforeSequence == null) return undefined;
    return { pageSize: 20, order: "sequence", query, beforeSequence: data.pagination.nextBeforeSequence, throughSequence: data.snapshotThroughSequence };
  },
  enabled: Boolean(query),
  gcTime: 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
});

export { useMessageSearch };
