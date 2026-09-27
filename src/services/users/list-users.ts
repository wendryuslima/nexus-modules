import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type {
  ListedUserDto,
  ListUsersResponseDto,
} from "@/types/users/list-users-dto";

const listUsers = async (): Promise<ListedUserDto[]> => {
  const response = await authenticatedApiRequest<ListUsersResponseDto>("/v1/users", {
    method: "GET",
  });

  return response.data;
};

export { listUsers };
