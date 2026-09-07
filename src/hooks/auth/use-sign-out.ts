import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "@/hooks/auth/auth-query-keys";
import { signOut } from "@/services/auth/sign-out";

const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.session(), {
        isAuthenticated: false,
        user: null,
      });
    },
  });
};

export { useSignOut };
