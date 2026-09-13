import { useQuery } from "@tanstack/react-query";

import { usersQueryKeys } from "@/hooks/users/users-query-keys";
import { listUsers } from "@/services/users/list-users";

const useUsers = () => {
  return useQuery({
    queryKey: usersQueryKeys.list(),
    queryFn: listUsers,
    retry: false,
  });
};

export { useUsers };
