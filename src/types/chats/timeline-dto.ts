type TimelineCursorDto = {
  id: string;
  createdAt: string;
};

type TimelineTextContentDto = {
  type: "TEXT";
  value: string;
};

type TimelineMessageDto = {
  senderId: string;
  isMine: boolean;
  content: TimelineTextContentDto;
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
  TimelineTextContentDto,
};
