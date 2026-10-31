import { useQuery } from "@tanstack/react-query";
import { imagesQueryKeys } from "@/hooks/images/images-query-keys";
import { sessionGeneration } from "@/services/auth/session-lifecycle";
import { getImageAccess } from "@/services/images/get-image-access";
import { ApiError } from "@/services/http/api-error";

const useImageAccess = (imageId: string) => useQuery({
  queryKey: imagesQueryKeys.access(sessionGeneration(), imageId),
  queryFn: ({ signal }) => getImageAccess(imageId, signal),
  staleTime: 9 * 60 * 1000,
  gcTime: 0,
  refetchInterval: (query) => query.state.status === "error" ? false : query.state.data
    ? Math.max(1000, Date.parse(query.state.data.expiresAt) - Date.now() - 30_000)
    : false,
  retry: (count, error) => count < 1 && !(error instanceof ApiError && error.status < 500),
});

export { useImageAccess };
