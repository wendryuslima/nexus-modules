type MessageContentDto = {
  type: "TEXT";
  value: string;
};

type CreateMessageRequestDto = {
  clientMessageId: string;
  content: MessageContentDto;
};

type MessageDto = {
  id: string;
  clientMessageId: string;
  chatId: string;
  sequence: number;
  senderId: string;
  content: MessageContentDto;
  createdAt: string;
  deliveryStatus: "PERSISTED";
};

type CreateMessageResponseDto = { data: MessageDto };

export type { CreateMessageRequestDto, CreateMessageResponseDto, MessageDto };
