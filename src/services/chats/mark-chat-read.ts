import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type { ChatReadState } from "@/types/chats/chat-read-state";

const markChatRead = (chatId: string, throughSequence: number, signal?: AbortSignal) =>
  authenticatedApiRequest<{ data: ChatReadState }>(`/v1/chats/${encodeURIComponent(chatId)}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ throughSequence }),
    signal,
  });

export { markChatRead };
