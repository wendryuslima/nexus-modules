import { assertSessionGeneration, finishSession, sessionGeneration } from "@/services/auth/session-lifecycle";
import { refreshSession } from "@/services/auth/refresh-session";
import { ApiError } from "@/services/http/api-error";
import { apiRequest } from "@/services/http/api-client";

const authenticatedApiRequest = async <T>(path: string, init: RequestInit): Promise<T> => {
  const generation = sessionGeneration();
  assertSessionGeneration(generation);
  try {
    const result = await apiRequest<T>(path, init);
    assertSessionGeneration(generation);
    return result;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || error.code !== "unauthenticated") {
      throw error;
    }

    try {
      await refreshSession();
    } catch (refreshError) {
      if (refreshError instanceof ApiError && refreshError.status === 401) {
        if (sessionGeneration() === generation) finishSession();
      }
      throw refreshError;
    }

    init.signal?.throwIfAborted();
    assertSessionGeneration(generation);
    const result = await apiRequest<T>(path, init);
    assertSessionGeneration(generation);
    return result;
  }
};

export { authenticatedApiRequest };
