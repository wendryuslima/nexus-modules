import { useInfiniteQuery } from "@tanstack/react-query";

import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { listTimeline } from "@/services/chats/list-timeline";
import type { ListTimelineParams } from "@/types/chats/timeline-dto";
import type { ListTimelineResponseDto } from "@/types/chats/timeline-dto";
import { preserveLiveTimeline, type TimelineViewData } from "@/lib/realtime-view-data";

const TIMELINE_PAGE_SIZE = 50;

const useTimeline = (chatId: string | undefined) => {
  const initialPageParam: ListTimelineParams = { pageSize: TIMELINE_PAGE_SIZE, order: "sequence" };

  return useInfiniteQuery<ListTimelineResponseDto, Error, TimelineViewData, ReturnType<typeof chatsQueryKeys.timeline>, ListTimelineParams>({
    queryKey: chatsQueryKeys.timeline(chatId ?? "", TIMELINE_PAGE_SIZE),
    queryFn: ({ pageParam, signal }) =>
      listTimeline(chatId ?? "", pageParam, signal),
    initialPageParam,
    getNextPageParam: ({ data }): ListTimelineParams | undefined => {
      if (!data.pagination.hasNext || data.pagination.nextBeforeSequence == null) return undefined;

      return {
        pageSize: data.pagination.pageSize,
        order: "sequence",
        beforeSequence: data.pagination.nextBeforeSequence,
      };
    },
    enabled: Boolean(chatId),
    structuralSharing: preserveLiveTimeline,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
};

export { useTimeline };
