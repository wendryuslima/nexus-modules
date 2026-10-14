import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type {
  CreateMessageRequestDto,
  CreateMessageResponseDto,
} from "@/types/chats/message-dto";

const createMessage = (
  chatId: string,
  payload: CreateMessageRequestDto,
): Promise<CreateMessageResponseDto> =>
  authenticatedApiRequest<CreateMessageResponseDto>(
    `/v1/chats/${encodeURIComponent(chatId)}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

export { createMessage };
