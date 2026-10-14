import { useInfiniteQuery } from "@tanstack/react-query";

import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { listTimeline } from "@/services/chats/list-timeline";
import type { ListTimelineParams } from "@/types/chats/timeline-dto";

const TIMELINE_PAGE_SIZE = 50;

const useTimeline = (chatId: string | undefined) => {
  const initialPageParam: ListTimelineParams = { pageSize: TIMELINE_PAGE_SIZE };

  return useInfiniteQuery({
    queryKey: chatsQueryKeys.timeline(chatId ?? "", TIMELINE_PAGE_SIZE),
    queryFn: ({ pageParam, signal }) =>
      listTimeline(chatId ?? "", pageParam, signal),
    initialPageParam,
    getNextPageParam: ({ data }): ListTimelineParams | undefined => {
      if (!data.pagination.hasNext || !data.pagination.nextCursor) return undefined;

      return {
        pageSize: data.pagination.pageSize,
        cursor: data.pagination.nextCursor,
      };
    },
    enabled: Boolean(chatId),
    retry: false,
  });
};

export { useTimeline };
