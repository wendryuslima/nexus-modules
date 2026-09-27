import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type { ListChatsParams, ListChatsResponseDto } from "@/types/chats/list-chats-dto";

const listChats = (
  { page, pageSize, cursor }: ListChatsParams,
  signal?: AbortSignal,
): Promise<ListChatsResponseDto> => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });

  if (page > 1 && cursor) {
    params.set("cursorId", cursor.id);
    params.set("cursorSortAt", cursor.sortAt);
  }

  return authenticatedApiRequest<ListChatsResponseDto>(`/v1/chats?${params}`, {
    method: "GET",
    signal,
  });
};

export { listChats };
