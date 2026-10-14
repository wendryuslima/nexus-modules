type TimelineCursorDto = {
  id: string;
  createdAt: string;
};

type TimelineTextContentDto = {
  type: "TEXT";
  value: string;
};

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
  senderId: string;
  isMine: boolean;
  content: TimelineTextContentDto;
  replyTo?: TimelineReplyDto;
  reactions?: TimelineReactionDto[];
};

type TimelineItemDto = {
  id: string;
  kind: "MESSAGE";
  createdAt: string;
  updatedAt: string;
  message: TimelineMessageDto;
};

type TimelinePaginationDto = {
  hasNext: boolean;
  nextCursor: TimelineCursorDto | null;
  pageSize: number;
};

type ListTimelineParams = {
  pageSize: number;
  cursor?: TimelineCursorDto;
};

type ListTimelineResponseDto = {
  data: {
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
