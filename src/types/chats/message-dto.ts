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

type MessageReplyDto = {
  senderId: string;
  sequence: number;
  content: MessageContentDto;
};

type CreateMessageRequestDto = {
  replyID?: string;
  clientMessageId: string;
  content: MessageContentDto;
};

type MessageDto = {
  replyID?: string;
  replyTo?: MessageReplyDto;
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

export type { MessageReplyDto, CreateMessageRequestDto, CreateMessageResponseDto, MessageDto, MessageContentDto, TextContentDto, ImageContentDto };
