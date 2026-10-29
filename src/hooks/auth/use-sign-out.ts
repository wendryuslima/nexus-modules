import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signOut } from "@/services/auth/sign-out";
import { suspendSession, finishSession, sessionGeneration } from "@/services/auth/session-lifecycle";
import { withSessionLock } from "@/services/auth/session-lock";

const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      suspendSession();
      const generation = sessionGeneration();
      await queryClient.cancelQueries();
      try { await withSessionLock(signOut); }
      catch { throw new Error("Não foi possível confirmar a revogação da sessão. Verifique sua conexão e tente sair novamente."); }
      return generation;
    },
    onSuccess: (generation) => { if (generation === sessionGeneration()) finishSession(); },
  });
};

export { useSignOut };
