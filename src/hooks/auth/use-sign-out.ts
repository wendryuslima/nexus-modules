import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "@/hooks/auth/auth-query-keys";
import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { usersQueryKeys } from "@/hooks/users/users-query-keys";
import { signOut } from "@/services/auth/sign-out";

const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: chatsQueryKeys.all() });
      queryClient.removeQueries({ queryKey: usersQueryKeys.all() });
      queryClient.setQueryData(authQueryKeys.session(), {
        isAuthenticated: false,
        user: null,
      });
    },
  });
};

export { useSignOut };
