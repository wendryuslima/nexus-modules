import { useInfiniteQuery } from "@tanstack/react-query";

import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { listChats } from "@/services/chats/list-chats";
import type { ListChatsParams, ListChatsResponseDto } from "@/types/chats/list-chats-dto";
import { preserveLiveChats, type ChatsViewData } from "@/lib/realtime-view-data";

const useChats = (query = "") => {
  const initialPageParam: ListChatsParams = { page: 1, pageSize: 30, ...(query ? { query } : {}) };
  const queryKey = query ? chatsQueryKeys.search(query) : chatsQueryKeys.list(initialPageParam.pageSize);

  return useInfiniteQuery<ListChatsResponseDto, Error, ChatsViewData, typeof queryKey, ListChatsParams>({
    queryKey,
    queryFn: ({ pageParam, signal }) => listChats(pageParam, signal),
    initialPageParam,
    getNextPageParam: ({ pagination }): ListChatsParams | undefined => {
      if (!pagination.hasNext || !pagination.nextCursor) return undefined;

      return {
        ...(query ? { query } : {}),
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
        cursor: pagination.nextCursor,
      };
    },
    retry: false,
    structuralSharing: query ? true : preserveLiveChats,
    gcTime: query ? 60_000 : 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export { useChats };
