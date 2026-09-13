import { refreshSession } from "@/services/auth/refresh-session";
import { ApiError } from "@/services/http/api-error";
import { apiRequest } from "@/services/http/api-client";
import type {
  ListedUserDto,
  ListUsersResponseDto,
} from "@/types/users/list-users-dto";

const requestUsers = async (): Promise<ListedUserDto[]> => {
  const response = await apiRequest<ListUsersResponseDto>("/v1/users", {
    method: "GET",
  });

  return response.data;
};

const listUsers = async (): Promise<ListedUserDto[]> => {
  try {
    return await requestUsers();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    await refreshSession();
    return requestUsers();
  }
};

export { listUsers };
