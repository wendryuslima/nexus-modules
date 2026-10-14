import { useInfiniteQuery } from "@tanstack/react-query";

import { usersQueryKeys } from "@/hooks/users/users-query-keys";
import { listUsers } from "@/services/users/list-users";
import type { ListUsersParams } from "@/types/users/list-users-dto";

const useUsers = () => {
  const initialPageParam: ListUsersParams = { page: 1, pageSize: 30 };
  return useInfiniteQuery({
    queryKey: usersQueryKeys.list(initialPageParam.pageSize),
    queryFn: ({ pageParam, signal }) => listUsers(pageParam, signal),
    initialPageParam,
    getNextPageParam: ({ pagination }): ListUsersParams | undefined => {
      if (!pagination.hasNext || !pagination.nextCursor) return undefined;
      return { page: pagination.page + 1, pageSize: pagination.pageSize, cursor: pagination.nextCursor };
    },
    retry: false,
  });
};

export { useUsers };
