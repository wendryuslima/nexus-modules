import { useQuery } from "@tanstack/react-query";

import { authQueryKeys } from "@/hooks/auth/auth-query-keys";
import { refreshSession } from "@/services/auth/refresh-session";
import { ApiError } from "@/services/http/api-error";

const useAuthSession = () => {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: async () => {
      try { return await refreshSession(); }
      catch (error) {
        if (error instanceof ApiError && error.status === 401) return { isAuthenticated: false, user: null };
        throw error;
      }
    },
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
};

export { useAuthSession };
