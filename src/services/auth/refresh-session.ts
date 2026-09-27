import { apiRequest } from "@/services/http/api-client";
import type { AuthSession } from "@/types/auth/auth-session";

let refreshPromise: Promise<AuthSession> | null = null;

const refreshSession = (): Promise<AuthSession> => {
  if (!refreshPromise) {
    refreshPromise = apiRequest<void>("/v1/auth/refresh", {
      method: "POST",
    })
      .then(() => ({ isAuthenticated: true, user: null }))
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export { refreshSession };
