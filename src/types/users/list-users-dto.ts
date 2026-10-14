type ListedUserDto = {
  user_id: string;
  email: string;
  created_at: string;
};

type ListUsersResponseDto = {
  data: ListedUserDto[];
  pagination: {
    hasNext: boolean;
    nextCursor: UserCursorDto | null;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

type UserCursorDto = { id: string; createdAt: string };
type ListUsersParams = { page: number; pageSize: number; cursor?: UserCursorDto };

export type { ListedUserDto, ListUsersParams, ListUsersResponseDto };
