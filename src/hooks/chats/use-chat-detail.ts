import { useQuery } from "@tanstack/react-query";
import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type { ListChatsResponseDto } from "@/types/chats/list-chats-dto";

const useChatDetail = (chatId: string | undefined) => useQuery({
  queryKey: chatsQueryKeys.detail(chatId ?? ""),
  queryFn: async ({ signal }) => {
    const response = await authenticatedApiRequest<ListChatsResponseDto>(`/v1/chats/${encodeURIComponent(chatId ?? "")}`, { method: "GET", signal });
    return response.data[0];
  },
  enabled: Boolean(chatId),
  staleTime: 60_000,
  gcTime: 60_000,
  retry: false,
});

export { useChatDetail };
