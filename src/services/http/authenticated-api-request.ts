import { authQueryKeys } from "@/hooks/auth/auth-query-keys";
import { queryClient } from "@/lib/query-client";
import { refreshSession } from "@/services/auth/refresh-session";
import { ApiError } from "@/services/http/api-error";
import { apiRequest } from "@/services/http/api-client";

const authenticatedApiRequest = async <T>(path: string, init: RequestInit): Promise<T> => {
  try {
    return await apiRequest<T>(path, init);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || error.code !== "unauthenticated") {
      throw error;
    }

    try {
      await refreshSession();
    } catch (refreshError) {
      if (refreshError instanceof ApiError && refreshError.status === 401) {
        queryClient.clear();
        queryClient.setQueryData(authQueryKeys.session(), {
          isAuthenticated: false,
          user: null,
        });
      }
      throw refreshError;
    }

    init.signal?.throwIfAborted();
    return apiRequest<T>(path, init);
  }
};

export { authenticatedApiRequest };
