import type { ChatDto } from "@/types/chats/list-chats-dto";

type CreateDirectChatRequestDto = {
  relatedUserId: string;
};

type CreateDirectChatResponseDto = {
  data: ChatDto;
};

export type { CreateDirectChatRequestDto, CreateDirectChatResponseDto };
