import type { MessageContentDto, TextContentDto } from "@/types/chats/message-dto";

type TimelineCursorDto = {
  id: string;
  createdAt: string;
};

type TimelineTextContentDto = TextContentDto;

type TimelineReplyDto = {
  authorName: string;
  content: string;
};

type TimelineReactionDto = {
  emoji: string;
  count: number;
  reactedByMe?: boolean;
};

type TimelineMessageDto = {
  clientMessageId?: string;
  senderId: string;
  isMine: boolean;
  content: MessageContentDto;
  replyTo?: TimelineReplyDto;
  reactions?: TimelineReactionDto[];
};

type TimelineItemDto = {
  sequence: number;
  id: string;
  kind: "MESSAGE";
  createdAt: string;
  updatedAt: string;
  message: TimelineMessageDto;
};

type TimelinePaginationDto = {
  nextBeforeSequence?: number | null;
  nextAfterSequence?: number | null;
  hasNext: boolean;
  nextCursor: TimelineCursorDto | null;
  pageSize: number;
};

type ListTimelineParams = {
  order?: "sequence";
  beforeSequence?: number;
  afterSequence?: number;
  throughSequence?: number;
  pageSize: number;
  cursor?: TimelineCursorDto;
};

type ListTimelineResponseDto = {
  data: {
    snapshotThroughSequence?: number;
    items: TimelineItemDto[];
    pagination: TimelinePaginationDto;
  };
};

export type {
  ListTimelineParams,
  ListTimelineResponseDto,
  TimelineCursorDto,
  TimelineItemDto,
  TimelineMessageDto,
  TimelinePaginationDto,
  TimelineReactionDto,
  TimelineReplyDto,
  TimelineTextContentDto,
};
