import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sessionGeneration, sessionSuspended, subscribeSessionLifecycle } from "@/services/auth/session-lifecycle";
import { RealtimeController, type RealtimeStatus } from "@/services/realtime/controller";
import { RealtimeContext } from "@/hooks/chats/use-realtime-status";
import { logRealtime } from "@/services/realtime/logger";

const lifecycleSnapshot = () => `${sessionGeneration()}:${sessionSuspended()}`;

const RealtimeProvider = ({ userId, children }: { userId?: string; children: ReactNode }) => {
  const client = useQueryClient();
  const lifecycle = useSyncExternalStore(subscribeSessionLifecycle, lifecycleSnapshot);
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  useEffect(() => {
    if (!userId || sessionSuspended()) {
      logRealtime("info", "Aguardando sessão autenticada para iniciar a conexão.");
      return;
    }
    const controller = new RealtimeController(client, userId, setStatus);
    controller.start();
    return () => controller.stop();
  }, [client, userId, lifecycle]);
  return <RealtimeContext value={sessionSuspended() ? "stopped" : status}>{children}</RealtimeContext>;
};

export { RealtimeProvider };
