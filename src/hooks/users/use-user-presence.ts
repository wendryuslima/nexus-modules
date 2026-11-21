import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { presenceQueryKeys } from "@/hooks/users/presence-query-keys";
import type { UserPresence } from "@/types/users/user-presence";

const useUserPresence = (userId?: string) => {
  const session = useAuthSession();
  const { data } = useQuery<UserPresence>({
    queryKey: presenceQueryKeys.session(session.data?.user?.id ?? ""),
    queryFn: skipToken,
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return data?.ready && userId ? data.onlineUserIds.includes(userId) : undefined;
};

export { useUserPresence };
