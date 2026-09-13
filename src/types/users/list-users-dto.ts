type ListedUserDto = {
  user_id: string;
  email: string;
  created_at: string;
};

type ListUsersResponseDto = {
  data: ListedUserDto[];
};

export type { ListedUserDto, ListUsersResponseDto };
