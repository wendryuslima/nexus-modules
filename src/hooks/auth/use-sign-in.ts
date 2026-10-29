import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "@/hooks/auth/auth-query-keys";
import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { usersQueryKeys } from "@/hooks/users/users-query-keys";
import { signIn } from "@/services/auth/sign-in";
import { suspendSession, resumeSession, announceSession, sessionGeneration } from "@/services/auth/session-lifecycle";
import { withSessionLock } from "@/services/auth/session-lock";

const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof signIn>[0]) => withSessionLock(() => signIn(payload)),
    onMutate: async () => { suspendSession(); const generation = sessionGeneration(); await queryClient.cancelQueries(); return { generation }; },
    onError: (_error, _variables, context) => { if (context?.generation === sessionGeneration()) resumeSession(); },
    onSuccess: (user, _variables, context) => {
      if (context?.generation !== sessionGeneration()) return;
      resumeSession();
      announceSession("identity-changed");
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
