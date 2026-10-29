import { apiRequest } from "@/services/http/api-client";
import type { AuthSession } from "@/types/auth/auth-session";
import type { AuthUser } from "@/types/auth/auth-user";

const getSession = async (): Promise<AuthSession> => {
  const { data } = await apiRequest<{ data: { user: AuthUser; accessExpiresAt: string } }>(
    "/v1/auth/session", { method: "GET", cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  if (!data?.user?.id || !data.user.email || !Number.isFinite(Date.parse(data.accessExpiresAt))) {
    throw new Error("A API retornou uma sessão inválida.");
  }
  return { isAuthenticated: true, user: data.user, accessExpiresAt: data.accessExpiresAt };
};

export { getSession };
