import { useQuery } from "@tanstack/react-query";

import { authQueryKeys } from "@/hooks/auth/auth-query-keys";
import { refreshSession } from "@/services/auth/refresh-session";

const useAuthSession = () => {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: refreshSession,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
};

export { useAuthSession };
