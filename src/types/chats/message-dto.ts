type TextContentDto = {
  type: "TEXT";
  value: string;
};

type ImageContentDto = {
  type: "IMAGE";
  imageId: string;
  caption?: string;
};

type MessageContentDto = TextContentDto | ImageContentDto;

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

export type { CreateMessageRequestDto, CreateMessageResponseDto, MessageDto, MessageContentDto, TextContentDto, ImageContentDto };
