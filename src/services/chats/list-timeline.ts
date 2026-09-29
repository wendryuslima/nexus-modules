import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type {
  ListTimelineParams,
  ListTimelineResponseDto,
} from "@/types/chats/timeline-dto";

const listTimeline = (
  chatId: string,
  { pageSize, cursor }: ListTimelineParams,
  signal?: AbortSignal,
): Promise<ListTimelineResponseDto> => {
  const params = new URLSearchParams({ pageSize: String(pageSize) });

  if (cursor) {
    params.set("cursorId", cursor.id);
    params.set("cursorCreatedAt", cursor.createdAt);
  }

  return authenticatedApiRequest<ListTimelineResponseDto>(
    `/v1/chats/${encodeURIComponent(chatId)}/timeline?${params}`,
    { method: "GET", signal },
  );
};

export { listTimeline };
