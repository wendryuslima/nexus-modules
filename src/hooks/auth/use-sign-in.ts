import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "@/hooks/auth/auth-query-keys";
import { signIn } from "@/services/auth/sign-in";

const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.session(), {
        isAuthenticated: true,
        user,
      });
    },
  });
};

export { useSignIn };
