import { authQueryKeys } from "@/hooks/auth/auth-query-keys";
import { queryClient } from "@/lib/query-client";

let generation = 0;
let suspended = false;
const listeners = new Set<() => void>();
const channel = typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("nexus-session") : null;

const sessionGeneration = () => generation;
const sessionSuspended = () => suspended;
const notify = () => { for (const listener of listeners) listener(); };

const suspendSession = () => { generation++; suspended = true; notify(); };
const resumeSession = () => { suspended = false; notify(); };

const assertSessionGeneration = (expected: number) => {
  if (expected !== generation || suspended) throw new DOMException("Sessão alterada.", "AbortError");
};

const finishSession = (broadcast = true) => {
  suspendSession();
  void queryClient.cancelQueries();
  queryClient.clear();
  queryClient.setQueryData(authQueryKeys.session(), { isAuthenticated: false, user: null });
  if (broadcast) channel?.postMessage({ type: "logout" });
};

const announceSession = (type: "access-renewed" | "identity-changed") => channel?.postMessage({ type });
const subscribeSessionLifecycle = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

if (channel) channel.onmessage = ({ data }: MessageEvent<unknown>) => {
  if (!data || typeof data !== "object" || !("type" in data)) return;
  if (data.type === "logout") finishSession(false);
  if (data.type === "access-renewed") {
    void queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
  }
  if (data.type === "identity-changed") {
    suspendSession();
    void queryClient.cancelQueries();
    queryClient.removeQueries({ queryKey: ["chats"] });
    queryClient.removeQueries({ queryKey: ["users"] });
    queryClient.removeQueries({ queryKey: ["images"] });
    resumeSession();
    void queryClient.resetQueries({ queryKey: authQueryKeys.session() });
  }
};

export { sessionGeneration, sessionSuspended, suspendSession, resumeSession, assertSessionGeneration, finishSession, announceSession, subscribeSessionLifecycle };
