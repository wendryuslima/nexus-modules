import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "@/hooks/auth/auth-query-keys";
import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { usersQueryKeys } from "@/hooks/users/users-query-keys";
import { signIn } from "@/services/auth/sign-in";

const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (user) => {
      queryClient.removeQueries({ queryKey: chatsQueryKeys.all() });
      queryClient.removeQueries({ queryKey: usersQueryKeys.all() });
      queryClient.setQueryData(authQueryKeys.session(), {
        isAuthenticated: true,
        user,
      });
    },
  });
};

export { useSignIn };
