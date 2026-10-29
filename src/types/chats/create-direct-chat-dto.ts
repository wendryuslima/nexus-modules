import type { ChatDto } from "@/types/chats/list-chats-dto";

type CreateDirectChatRequestDto = {
  relatedUserId: string;
};

type CreateDirectChatResponseDto = {
  data: Omit<ChatDto, "lastSequence" | "relatedUserEmail">;
};

export type { CreateDirectChatRequestDto, CreateDirectChatResponseDto };
