import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { invalidateBackendQuery } from "@/lib/invalidate-backend-query";
import { refreshSession } from "@/services/auth/refresh-session";
import { finishSession, sessionGeneration, sessionSuspended } from "@/services/auth/session-lifecycle";
import { ApiError } from "@/services/http/api-error";
import { apiUrl } from "@/services/http/api-client";
import { IncompatibleProtocolError, parseRealtimeEvent, type MessageCreatedEvent } from "@/services/realtime/protocol";
import { logRealtime } from "@/services/realtime/logger";
import { appendRealtimeMessage, timelineThroughSequence, updateRealtimeChat, type TimelineViewData, type ChatsViewData } from "@/lib/realtime-view-data";

type RealtimeStatus = "connecting" | "connected" | "syncing" | "reconnecting" | "offline" | "incompatible" | "stopped";

class RealtimeController {
  private active = false;
  private epoch = 0;
  private generation = sessionGeneration();
  private socket?: WebSocket;
  private ready = false;
  private attempt = 0;
  private reconnect?: ReturnType<typeof setTimeout>;
  private readyTimeout?: ReturnType<typeof setTimeout>;
  private syncRetry?: ReturnType<typeof setTimeout>;
  private listRefresh?: ReturnType<typeof setTimeout>;
  private periodic?: ReturnType<typeof setInterval>;
  private pending = new Map<string, QueryKey>();
  private running = new Map<string, symbol>();
  private failedSync = new Map<string, QueryKey>();
  private lastDiagnostic = 0;
  private recovering = false;
  private unsubscribe?: () => void;
  private earlyEvents = new Map<string, MessageCreatedEvent>();
  private earlyBytes = 0;

  private client: QueryClient;
  private userId: string;
  private onStatus: (value: RealtimeStatus) => void;
  private lastStatus?: RealtimeStatus;

  constructor(client: QueryClient, userId: string, status: (value: RealtimeStatus) => void) {
    this.client = client; this.userId = userId; this.onStatus = status;
  }

  private status(value: RealtimeStatus) {
    if (this.lastStatus !== value) logRealtime("info", "Estado da conexão.", { status: value });
    this.lastStatus = value;
    this.onStatus(value);
  }

  start() {
    this.active = true;
    this.unsubscribe = this.client.getQueryCache().subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "success" || event.action.manual || !this.current() || !this.ready) return;
      for (const [id, buffered] of this.earlyEvents) {
        if (!this.applyEvent(buffered)) {
          this.earlyEvents.delete(id);
          this.earlyBytes -= new TextEncoder().encode(JSON.stringify(buffered)).byteLength;
        }
      }
    });
    logRealtime("info", "Iniciando conexão automática da sessão autenticada.");
    if (!navigator.locks) logRealtime("error", "Web Locks indisponível. Use um navegador compatível em HTTPS ou localhost para consultar/renovar a sessão.");
    window.addEventListener("online", this.onOnline);
    window.addEventListener("offline", this.onOffline);
    document.addEventListener("visibilitychange", this.onVisible);
    this.periodic = setInterval(() => { if (document.visibilityState === "visible") this.synchronizeAll(); }, 60_000);
    void this.connect();
  }

  stop() {
    if (!this.active) return;
    this.active = false; this.epoch++; this.ready = false;
    logRealtime("info", "Encerrando conexão e cancelando atualizações agendadas.");
    clearTimeout(this.reconnect); clearTimeout(this.readyTimeout); clearTimeout(this.syncRetry); clearTimeout(this.listRefresh); clearInterval(this.periodic);
    window.removeEventListener("online", this.onOnline);
    window.removeEventListener("offline", this.onOffline);
    document.removeEventListener("visibilitychange", this.onVisible);
    this.socket?.close(1000, "session stopped");
    this.pending.clear(); this.running.clear(); this.failedSync.clear();
    this.unsubscribe?.(); this.earlyEvents.clear(); this.earlyBytes = 0;
  }

  private current(epoch = this.epoch) {
    return this.active && epoch === this.epoch && this.generation === sessionGeneration() && !sessionSuspended();
  }

  private async connect() {
    if (!this.current()) return;
    if (!navigator.onLine) {
      logRealtime("warn", "Navegador offline; aguardando conectividade.");
      this.status("offline"); return;
    }
    const epoch = ++this.epoch;
    clearTimeout(this.readyTimeout);
    this.socket?.close(1000, "reconnecting"); this.socket = undefined;
    this.ready = false;
    this.pending.clear(); this.running.clear(); this.failedSync.clear();
    this.status(this.attempt ? "reconnecting" : "connecting");
    try {
      logRealtime("info", "Verificando sessão antes de abrir o WebSocket.");
      const session = await refreshSession();
      if (!this.current(epoch)) return;
      if (session.user?.id !== this.userId) {
        logRealtime("warn", "Identidade da sessão mudou; encerrando conexão anterior.");
        this.stop(); this.client.clear(); window.location.assign("/signin"); return;
      }
      const url = new URL(`${apiUrl}/v1/realtime`, window.location.href);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      logRealtime("info", "Abrindo conexão.", { url: url.origin + url.pathname });
      const socket = new WebSocket(url);
      this.socket = socket;
      socket.onopen = () => {
        if (this.current(epoch)) logRealtime("info", "Conexão aberta; aguardando connection.ready.");
      };
      socket.onerror = () => {
        if (this.current(epoch)) logRealtime("error", "Erro no WebSocket. Consulte Network > WS para ver o handshake; verifique API, origem e cookies.");
      };
      this.readyTimeout = setTimeout(() => {
        if (this.current(epoch) && !this.ready) {
          logRealtime("warn", "Tempo esgotado aguardando connection.ready.");
          socket.close(1000, "readiness timeout");
        }
      }, 15_000);
      socket.onmessage = ({ data }: MessageEvent<unknown>) => {
        if (!this.current(epoch)) return;
        try {
          if (typeof data !== "string" || new TextEncoder().encode(data).byteLength > 32768) throw new Error("Frame inválido.");
          const event = parseRealtimeEvent(data);
          if (!event) {
            if (Date.now() - this.lastDiagnostic > 5_000) { this.lastDiagnostic = Date.now(); logRealtime("warn", "Evento desconhecido; atualizando pelo backend."); this.synchronizeAll(); }
            return;
          }
          if (event.type === "connection.ready") {
            if (this.ready || event.data.userId !== this.userId) throw new Error("Identidade da conexão inválida.");
            clearTimeout(this.readyTimeout); this.ready = true; this.attempt = 0;
            logRealtime("info", "connection.ready recebido; gateway pronto para entregar eventos.");
            this.status("connected"); this.synchronizeAll(true);
          } else {
            if (!this.ready) throw new Error("Mensagem recebida antes da prontidão.");
            this.receive(event);
          }
        } catch (error) {
          const incompatible = error instanceof IncompatibleProtocolError;
          logRealtime("error", "Evento rejeitado; conexão interrompida.", { incompatible });
          this.stop(); this.status(incompatible ? "incompatible" : "stopped");
        }
      };
      socket.onclose = ({ code, wasClean }) => {
        if (!this.current(epoch)) return;
        logRealtime("warn", "Conexão fechada.", { code, wasClean: Boolean(wasClean) });
        this.ready = false; this.epoch++; clearTimeout(this.readyTimeout);
        this.pending.clear(); this.running.clear(); this.failedSync.clear();
        this.earlyEvents.clear(); this.earlyBytes = 0;
        if (code === 4003) { this.stop(); finishSession(); return; }
        if (code === 1008 || code === 1009) { this.stop(); this.status("stopped"); return; }
        this.scheduleReconnect();
      };
    } catch (error) {
      if (!this.current(epoch)) return;
      logRealtime("error", "Não foi possível iniciar a conexão.", error instanceof ApiError
        ? { phase: "session", status: error.status, code: error.code }
        : { phase: "session-or-socket", errorName: error instanceof Error ? error.name : "unknown" });
      if (error instanceof ApiError && error.status === 401) { this.stop(); finishSession(); return; }
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.current()) return;
    this.status(navigator.onLine ? "reconnecting" : "offline");
    clearTimeout(this.reconnect);
    const delay = Math.random() * Math.min(30_000, 1_000 * 2 ** Math.min(this.attempt++, 5));
    logRealtime("info", "Reconexão agendada.", { attempt: this.attempt, delayMs: Math.round(delay) });
    this.reconnect = setTimeout(() => { void this.connect(); }, delay);
  }

  private onOnline = () => { if (!this.ready) { clearTimeout(this.reconnect); void this.connect(); } else this.synchronizeAll(); };
  private onOffline = () => { this.status("offline"); this.socket?.close(1000, "offline"); };
  private onVisible = () => { if (document.visibilityState === "visible") this.synchronizeAll(); };

  private synchronizeAll(recovery = false) {
    if (!this.current() || !this.ready) return;
    this.recovering ||= recovery;
    this.requestRefresh(chatsQueryKeys.lists());
    for (const query of this.client.getQueryCache().findAll({ queryKey: chatsQueryKeys.timelines() })) {
      this.requestRefresh(query.queryKey);
    }
  }

  private receive(event: MessageCreatedEvent) {
    const queries = this.client.getQueryCache().findAll({ queryKey: chatsQueryKeys.timelineForChat(event.data.chatId) });
    logRealtime("info", "message.created recebido; atualizando tela pelo WebSocket.", {
      matchedTimelines: queries.length, activeTimelines: queries.filter((query) => query.isActive()).length,
    });
    if (this.applyEvent(event) && !this.earlyEvents.has(event.eventId)) {
      this.earlyEvents.set(event.eventId, event);
      this.earlyBytes += new TextEncoder().encode(JSON.stringify(event)).byteLength;
      if (this.earlyEvents.size > 100 || this.earlyBytes > 1048576) this.socket?.close(1000, "initial load buffer full");
    }
  }

  private applyEvent(event: MessageCreatedEvent): boolean {
    let waiting = false;
    const historyKey = ["chats", "history-notification", event.data.chatId];
    if (this.client.getQueryData<number>(historyKey) !== undefined) {
      this.client.setQueryData<number>(historyKey, (previous = 0) => Math.max(previous, event.data.sequence));
    }
    for (const query of this.client.getQueryCache().findAll({ queryKey: chatsQueryKeys.timelineForChat(event.data.chatId), type: "active" })) {
      const data = query.state.data as TimelineViewData | undefined;
      if (!data) { waiting = true; continue; }
      const through = timelineThroughSequence(data);
      this.client.setQueryData<TimelineViewData>(query.queryKey, (current) => current && appendRealtimeMessage(current, event, this.userId));
      if (through !== undefined && event.data.sequence > through + 1) {
        if (query.state.fetchStatus === "fetching") waiting = true;
        else {
          logRealtime("warn", "Lacuna na sequência; recuperando mensagens pelo backend.");
          this.recovering = true;
          this.requestRefresh(query.queryKey);
        }
      }
    }
    for (const query of this.client.getQueryCache().findAll({ queryKey: chatsQueryKeys.lists(), type: "active" })) {
      const data = query.state.data as ChatsViewData | undefined;
      if (!data) { waiting = true; continue; }
      const known = data.pages.some((page) => page.data.some((chat) => chat.id === event.data.chatId));
      if (known) this.client.setQueryData<ChatsViewData>(query.queryKey, (current) => current && updateRealtimeChat(current, event));
      else this.refreshChats();
    }
    return waiting;
  }

  private requestRefresh(queryKey: QueryKey) {
    if (!this.current() || !this.ready) return;
    this.pending.set(JSON.stringify(queryKey), queryKey);
    this.pump();
  }

  private pump() {
    if (!this.current() || !this.ready) return;
    for (const [id, queryKey] of this.pending) {
      if (this.running.size >= 2) break;
      if (this.running.has(id)) continue;
      this.pending.delete(id);
      const token = Symbol();
      this.running.set(id, token);
      if (this.recovering) this.status("syncing");
      const epoch = this.epoch;
      const target = queryKey[1] === "timeline" ? "timeline" : "conversations";
      const activeQueries = this.client.getQueryCache().findAll({ queryKey, type: "active" }).length;
      logRealtime("info", "Iniciando atualização pelo backend.", { target, activeQueries });
      void invalidateBackendQuery(this.client, queryKey, () => this.current(epoch) && this.ready).then(() => {
        if (this.current(epoch)) {
          this.failedSync.delete(id);
          logRealtime("info", "Atualização pelo backend concluída.", { target });
        }
      }).catch((error: unknown) => {
        if (!this.current(epoch)) return;
        logRealtime("error", "Falha ao atualizar pelo backend; nova tentativa em 2 segundos.",
          error instanceof ApiError ? { target, status: error.status, code: error.code } : { target });
        this.failedSync.set(id, queryKey);
        clearTimeout(this.syncRetry);
        this.syncRetry = setTimeout(() => {
          for (const key of this.failedSync.values()) this.requestRefresh(key);
        }, 2_000);
      }).finally(() => {
        if (this.running.get(id) !== token) return;
        this.running.delete(id);
        if (this.current(epoch) && this.ready) {
          this.pump();
          if (!this.running.size && !this.pending.size) {
            if (this.failedSync.size && this.recovering) this.status("syncing");
            else { this.status("connected"); this.recovering = false; }
          }
        }
      });
    }
  }

  private refreshChats() {
    if (this.listRefresh) return;
    this.listRefresh = setTimeout(() => {
      this.listRefresh = undefined;
      this.requestRefresh(chatsQueryKeys.lists());
    }, 500);
  }
}

export { RealtimeController };
export type { RealtimeStatus };
