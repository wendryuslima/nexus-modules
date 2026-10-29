import { useInfiniteQuery } from "@tanstack/react-query";

import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { listChats } from "@/services/chats/list-chats";
import type { ListChatsParams, ListChatsResponseDto } from "@/types/chats/list-chats-dto";
import { preserveLiveChats, type ChatsViewData } from "@/lib/realtime-view-data";

const useChats = () => {
  const initialPageParam: ListChatsParams = { page: 1, pageSize: 30 };

  return useInfiniteQuery<ListChatsResponseDto, Error, ChatsViewData, ReturnType<typeof chatsQueryKeys.list>, ListChatsParams>({
    queryKey: chatsQueryKeys.list(initialPageParam.pageSize),
    queryFn: ({ pageParam, signal }) => listChats(pageParam, signal),
    initialPageParam,
    getNextPageParam: ({ pagination }): ListChatsParams | undefined => {
      if (!pagination.hasNext || !pagination.nextCursor) return undefined;

      return {
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
        cursor: pagination.nextCursor,
      };
    },
    retry: false,
    structuralSharing: preserveLiveChats,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export { useChats };
