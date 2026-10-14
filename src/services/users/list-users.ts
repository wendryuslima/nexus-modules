import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type { ListUsersParams, ListUsersResponseDto } from "@/types/users/list-users-dto";

const listUsers = ({ page, pageSize, cursor }: ListUsersParams = { page: 1, pageSize: 30 }, signal?: AbortSignal): Promise<ListUsersResponseDto> => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (page > 1 && cursor) {
    params.set("cursorId", cursor.id);
    params.set("cursorCreatedAt", cursor.createdAt);
  }
  return authenticatedApiRequest<ListUsersResponseDto>(`/v1/users?${params}`, {
    method: "GET",
    signal,
  });
};

export { listUsers };
