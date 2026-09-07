import { apiRequest } from "@/services/http/api-client";
import type { AuthSession } from "@/types/auth/auth-session";

const refreshSession = async (): Promise<AuthSession> => {
  await apiRequest<void>("/v1/auth/refresh", {
    method: "POST",
  });

  return { isAuthenticated: true, user: null };
};

export { refreshSession };
