import { apiRequest } from "@/services/http/api-client";
import type { AuthSession } from "@/types/auth/auth-session";
import { ApiError } from "@/services/http/api-error";
import { getSession } from "@/services/auth/get-session";
import { withSessionLock } from "@/services/auth/session-lock";
import { announceSession, assertSessionGeneration, sessionGeneration } from "@/services/auth/session-lifecycle";

let refreshPromise: Promise<AuthSession> | null = null;
let refreshGeneration = -1;

const refreshSession = (): Promise<AuthSession> => {
  const generation = sessionGeneration();
  if (!refreshPromise || refreshGeneration !== generation) {
    refreshGeneration = generation;
    refreshPromise = withSessionLock(async () => {
      assertSessionGeneration(generation);
      try {
        const session = await getSession();
        assertSessionGeneration(generation);
        return session;
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
      }
      assertSessionGeneration(generation);
      await apiRequest<void>("/v1/auth/refresh", { method: "POST", signal: AbortSignal.timeout(15_000) });
      const session = await getSession();
      assertSessionGeneration(generation);
      announceSession("access-renewed");
      return session;
    })
      .finally(() => {
        if (refreshGeneration === generation) refreshPromise = null;
      });
  }

  return refreshPromise;
};

export { refreshSession };
