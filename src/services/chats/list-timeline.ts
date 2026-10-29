import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type {
  ListTimelineParams,
  ListTimelineResponseDto,
} from "@/types/chats/timeline-dto";

const listTimeline = (
  chatId: string,
  { pageSize, cursor, order, beforeSequence, afterSequence, throughSequence }: ListTimelineParams,
  signal?: AbortSignal,
): Promise<ListTimelineResponseDto> => {
  const params = new URLSearchParams({ pageSize: String(pageSize) });
  if (order) params.set("order", order);
  if (beforeSequence !== undefined) params.set("beforeSequence", String(beforeSequence));
  if (afterSequence !== undefined) params.set("afterSequence", String(afterSequence));
  if (throughSequence !== undefined) params.set("throughSequence", String(throughSequence));

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
