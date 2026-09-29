import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type {
  CreateDirectChatRequestDto,
  CreateDirectChatResponseDto,
} from "@/types/chats/create-direct-chat-dto";

const createDirectChat = (
  payload: CreateDirectChatRequestDto,
  signal?: AbortSignal,
): Promise<CreateDirectChatResponseDto> =>
  authenticatedApiRequest<CreateDirectChatResponseDto>("/v1/chats/direct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

export { createDirectChat };
