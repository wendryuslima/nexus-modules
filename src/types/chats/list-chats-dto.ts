type ChatDto = {
  id: string;
  relatedUser: string;
  createdAt: string;
  updatedAt: string;
  summarySortAt: string;
};

type ChatCursorDto = {
  id: string;
  sortAt: string;
};

type ChatPaginationDto = {
  hasNext: boolean;
  nextCursor: ChatCursorDto | null;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type ListChatsParams = {
  page: number;
  pageSize: number;
  cursor?: ChatCursorDto;
};

type ListChatsResponseDto = {
  data: ChatDto[];
  pagination: ChatPaginationDto;
};

export type { ChatDto, ChatCursorDto, ChatPaginationDto, ListChatsParams, ListChatsResponseDto };
