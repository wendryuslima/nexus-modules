import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { InfiniteQueryObserver, QueryClient, QueryObserver } from "@tanstack/react-query";
import { RealtimeController } from "../src/services/realtime/controller";
import { chatsQueryKeys } from "../src/hooks/chats/chats-query-keys";
import { preserveLiveTimeline, preserveLiveChats, visibleChats, type TimelineViewData as TimelineData, type ChatsViewData } from "../src/lib/realtime-view-data";
import { mergeTimelinePages } from "../src/lib/merge-timeline-pages";
import type { ListChatsResponseDto } from "../src/types/chats/list-chats-dto";
import { listTimeline } from "../src/services/chats/list-timeline";
import { resumeSession, suspendSession } from "../src/services/auth/session-lifecycle";
import type { ListTimelineParams, ListTimelineResponseDto, TimelineItemDto } from "../src/types/chats/timeline-dto";

const originalFetch = globalThis.fetch;
const descriptors = new Map<string, PropertyDescriptor | undefined>();
const cleanups: Array<() => void> = [];
let logs: unknown[][] = [];
const restoreConsole: Array<() => void> = [];


beforeEach(() => {
  logs = [];
  for (const level of ["info", "warn", "error"] as const) {
    const spy = spyOn(console, level).mockImplementation((...args) => { logs.push(args); });
    restoreConsole.push(() => spy.mockRestore());
  }
});

class TestWebSocket {
  static instances: TestWebSocket[] = [];
  onopen?: () => void;
  onerror?: () => void;
  onmessage?: (event: { data: string }) => void;
  onclose?: (event: { code: number; wasClean: boolean }) => void;
  readonly url: URL;
  constructor(url: URL) {
    this.url = url; TestWebSocket.instances.push(this);
    queueMicrotask(() => this.onopen?.());
  }
  frame(event: unknown) { this.onmessage?.({ data: JSON.stringify(event) }); }
  close(code: number) { queueMicrotask(() => this.onclose?.({ code, wasClean: code === 1000 })); }
}

const installGlobal = (name: string, value: unknown) => {
  descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
};

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  for (const [name, descriptor] of descriptors) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
  descriptors.clear(); TestWebSocket.instances = [];
  globalThis.fetch = originalFetch; resumeSession();
  for (const restore of restoreConsole.splice(0)) restore();
});

const message = (sequence: number): TimelineItemDto => ({
  id: `message-${sequence}`, sequence, kind: "MESSAGE", createdAt: "2026-10-27T12:00:00Z", updatedAt: "2026-10-27T12:00:00Z",
  message: { senderId: "user-2", isMine: false, content: { type: "TEXT", value: `Backend ${sequence}` } },
});
const page = (sequences: number[], nextBeforeSequence: number | null = null): ListTimelineResponseDto => ({
  data: {
    items: sequences.map(message), snapshotThroughSequence: sequences.at(-1) ?? 0,
    pagination: { hasNext: nextBeforeSequence !== null, nextCursor: null, nextBeforeSequence, pageSize: 50 },
  },
});
const key = ["chats", "timeline", "chat-1", 50];
const ready = { version: 1, type: "connection.ready", data: { connectionId: "connection-1", userId: "user-1", accessExpiresAt: "2099-01-01T00:00:00Z" } };
const event = (sequence: number, chatId = "chat-1") => ({
  version: 1, type: "message.created", eventId: `event-${sequence}`, occurredAt: "2026-10-27T12:00:00Z",
  data: { id: `message-${sequence}`, chatId, sequence, senderId: "user-2", content: { type: "TEXT", value: "Mensagem via WebSocket" }, createdAt: "2026-10-27T12:00:00Z" },
});
const auth = () => Response.json({ data: { user: { id: "user-1", email: "user@example.com" }, accessExpiresAt: "2099-01-01T00:00:00Z" } });
const until = async (condition: () => boolean) => {
  for (let i = 0; i < 600; i++) { if (condition()) return; await new Promise((resolve) => setTimeout(resolve, 5)); }
  throw new Error("Expected asynchronous transition did not happen.");
};

const fixture = (initial?: TimelineData) => {
  const windowEvents = new EventTarget();
  installGlobal("window", { location: { href: "http://localhost:5172", assign: () => {} },
    addEventListener: windowEvents.addEventListener.bind(windowEvents), removeEventListener: windowEvents.removeEventListener.bind(windowEvents) });
  const documentEvents = new EventTarget();
  installGlobal("document", { visibilityState: "visible", addEventListener: documentEvents.addEventListener.bind(documentEvents), removeEventListener: documentEvents.removeEventListener.bind(documentEvents) });
  installGlobal("navigator", { onLine: true, locks: { request: async (_name: string, _options: unknown, operation: () => Promise<unknown>) => operation() } });
  installGlobal("WebSocket", TestWebSocket);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  const observer = new InfiniteQueryObserver(client, {
    queryKey: key,
    initialData: initial,
    structuralSharing: preserveLiveTimeline,
    initialPageParam: { pageSize: 50, order: "sequence" } as ListTimelineParams,
    queryFn: ({ pageParam, signal }) => listTimeline("chat-1", pageParam, signal),
    getNextPageParam: ({ data }): ListTimelineParams | undefined =>
      data.pagination.nextBeforeSequence == null ? undefined : { pageSize: 50, order: "sequence", beforeSequence: data.pagination.nextBeforeSequence },
  });
  const unsubscribe = observer.subscribe(() => {});
  const states: string[] = [];
  const controller = new RealtimeController(client, "user-1", (state) => states.push(state));
  cleanups.push(() => { controller.stop(); unsubscribe(); client.clear(); });
  return { client, controller, states, documentEvents, observer };
};
const initial: TimelineData = { pages: [page([182])], pageParams: [{ pageSize: 50, order: "sequence" }] };

test("eventos atualizam a timeline sem GET ou faixa de sincronização por mensagem", async () => {
  let requests = 0;
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  globalThis.fetch = (async (input, init) => {
    if (new URL(String(input)).pathname === "/v1/auth/session") return auth();
    expect(init?.cache).toBe("no-store");
    requests++; await gate;
    return Response.json(page([182]));
  }) as typeof fetch;
  const { client, controller, states } = fixture(initial);
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  const socket = TestWebSocket.instances[0];
  expect(socket.url.pathname).toBe("/v1/realtime");
  expect(socket.url.search).toBe("");
  expect(states.at(-1)).toBe("connecting");
  expect(logs.some(([text]) => String(text).includes("[WS] Conexão aberta"))).toBe(true);
  socket.frame(ready);
  await until(() => requests === 1);
  for (let i = 0; i < 10; i++) socket.frame(event(183));
  const rendered = () => {
    const data = client.getQueryData<TimelineData>(key)!;
    return mergeTimelinePages(data.pages, data.liveMessages);
  };
  expect(rendered().map((item) => item.sequence)).toEqual([182, 183]);
  expect(rendered()[1].message.content.value).toBe("Mensagem via WebSocket");
  release();
  await until(() => states.at(-1) === "connected");
  expect(requests).toBe(1);
  expect(rendered().map((item) => item.sequence)).toEqual([182, 183]);
  const transitions = states.length;
  socket.frame(event(184));
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(requests).toBe(1);
  expect(states.slice(transitions)).not.toContain("syncing");
  expect(rendered().map((item) => item.sequence)).toEqual([182, 183, 184]);
  expect(logs.some(([text]) => String(text).includes("connection.ready recebido"))).toBe(true);
  expect(logs.some(([text, details]) => String(text).includes("message.created recebido") && (details as { activeTimelines: number }).activeTimelines === 1)).toBe(true);
  const logged = JSON.stringify(logs);
  expect(logged).not.toContain("Mensagem via WebSocket");
  expect(logged).not.toContain("user@example.com");
  expect(logged).not.toContain("user-1");
});

test("erro e fechamento do socket geram diagnóstico e reconexão automática", async () => {
  globalThis.fetch = (async (input) => new URL(String(input)).pathname === "/v1/auth/session" ? auth() : Response.json(page([183]))) as typeof fetch;
  const { controller, states } = fixture(initial);
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  const socket = TestWebSocket.instances[0];
  socket.onerror?.();
  socket.close(1006);
  await until(() => states.at(-1) === "reconnecting");
  expect(logs.some(([text]) => String(text).includes("[WS] Erro no WebSocket"))).toBe(true);
  expect(logs.some(([text, details]) => String(text).includes("Conexão fechada") && (details as { code: number }).code === 1006)).toBe(true);
  expect(logs.some(([text]) => String(text).includes("Reconexão agendada"))).toBe(true);
});

test("invalidação recarrega todas as páginas HTTP usando os novos cursores do backend", async () => {
  const requests: URL[] = [];
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    if (url.pathname === "/v1/auth/session") return auth();
    requests.push(url);
    return Response.json(url.searchParams.has("beforeSequence") ? page([181]) : page([183], 183));
  }) as typeof fetch;
  const { client, controller, states } = fixture({
    pages: [page([182], 182), page([180])],
    pageParams: [{ pageSize: 50, order: "sequence" }, { pageSize: 50, order: "sequence", beforeSequence: 182 }],
  });
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  TestWebSocket.instances[0].frame(ready);
  await until(() => requests.length === 2 && states.at(-1) === "connected");
  expect(requests[1].searchParams.get("beforeSequence")).toBe("183");
  expect(client.getQueryData<TimelineData>(key)?.pages.flatMap((p) => p.data.items.map((item) => item.sequence))).toEqual([183, 181]);
});

test("prontidão durante carga inicial exige uma leitura posterior à assinatura", async () => {
  let requests = 0;
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  globalThis.fetch = (async (input) => {
    if (new URL(String(input)).pathname === "/v1/auth/session") return auth();
    const index = ++requests;
    if (index === 1) await gate;
    return Response.json(page([index === 1 ? 182 : 183]));
  }) as typeof fetch;
  const { client, controller, states } = fixture();
  controller.start();
  await until(() => TestWebSocket.instances.length === 1 && requests === 1);
  TestWebSocket.instances[0].frame(ready);
  release();
  await until(() => requests === 2 && states.at(-1) === "connected");
  expect(client.getQueryData<TimelineData>(key)?.pages[0].data.items.map((item) => item.sequence)).toEqual([183]);
});

test("logout durante HTTP impede resposta e novos eventos da sessão anterior", async () => {
  let requests = 0;
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  globalThis.fetch = (async (input) => {
    if (new URL(String(input)).pathname === "/v1/auth/session") return auth();
    requests++; await gate;
    return Response.json(page([183]));
  }) as typeof fetch;
  const { client, controller } = fixture(initial);
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  const socket = TestWebSocket.instances[0];
  socket.frame(ready);
  await until(() => requests === 1);
  suspendSession(); release(); socket.frame(event(185));
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(requests).toBe(1);
  expect(client.getQueryData<TimelineData>(key)?.pages[0].data.items.map((item) => item.sequence)).toEqual([182]);
});

test("mensagens de conversas conhecidas atualizam a lista sem refetch", async () => {
  let timelineRequests = 0, listRequests = 0;
  globalThis.fetch = (async (input) => {
    if (new URL(String(input)).pathname === "/v1/auth/session") return auth();
    timelineRequests++;
    return Response.json(page([182]));
  }) as typeof fetch;
  const { client, controller, states } = fixture(initial);
  const chats: ListChatsResponseDto = {
    data: [
      { id: "chat-2", lastSequence: 1, relatedUser: "user-3", relatedUserEmail: "other@example.com", createdAt: "2026-10-25T12:00:00Z", updatedAt: "2026-10-25T12:00:00Z", summarySortAt: "2026-10-26T12:00:00Z" },
      { id: "chat-1", lastSequence: 182, relatedUser: "user-2", relatedUserEmail: "related@example.com", createdAt: "2026-10-25T12:00:00Z", updatedAt: "2026-10-25T12:00:00Z", summarySortAt: "2026-10-25T12:00:00Z" },
    ],
    pagination: { hasNext: false, nextCursor: null, page: 1, pageSize: 30, totalItems: 2, totalPages: 1 },
  };
  const listKey = ["chats", "list", 30];
  const lists = new QueryObserver(client, {
    queryKey: listKey, initialData: { pages: [chats], pageParams: [{ page: 1, pageSize: 30 }] },
    structuralSharing: preserveLiveChats,
    queryFn: async () => { listRequests++; return { pages: [chats], pageParams: [{ page: 1, pageSize: 30 }] }; },
  });
  const unsubscribe = lists.subscribe(() => {});
  cleanups.push(unsubscribe);
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  TestWebSocket.instances[0].frame(ready);
  await until(() => states.at(-1) === "connected" && listRequests === 1);
  TestWebSocket.instances[0].frame(event(183));
  TestWebSocket.instances[0].frame(event(183));
  await new Promise((resolve) => setTimeout(resolve, 550));
  expect(timelineRequests).toBe(1);
  expect(listRequests).toBe(1);
  expect(visibleChats(client.getQueryData<ChatsViewData>(listKey)!)[0]).toMatchObject({ id: "chat-1", lastSequence: 183, summarySortAt: "2026-10-27T12:00:00Z" });
  expect(states.at(-1)).toBe("connected");
});

test("lacuna recupera por HTTP e incorpora o evento sem duplicação", async () => {
  let requests = 0;
  globalThis.fetch = (async (input) => {
    if (new URL(String(input)).pathname === "/v1/auth/session") return auth();
    requests++;
    return Response.json(page(requests === 1 ? [182] : [182, 183, 184]));
  }) as typeof fetch;
  const { client, controller, states } = fixture(initial);
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  TestWebSocket.instances[0].frame(ready);
  await until(() => states.at(-1) === "connected" && requests === 1);
  TestWebSocket.instances[0].frame(event(184));
  await until(() => states.at(-1) === "connected" && requests === 2);
  const data = client.getQueryData<TimelineData>(key)!;
  expect(mergeTimelinePages(data.pages, data.liveMessages).map((item) => item.sequence)).toEqual([182, 183, 184]);
});

test("evento durante a primeira carga é preservado sem disparar GET adicional", async () => {
  let requests = 0;
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  globalThis.fetch = (async (input) => {
    if (new URL(String(input)).pathname === "/v1/auth/session") return auth();
    requests++;
    if (requests === 3) await gate;
    return Response.json(page([182]));
  }) as typeof fetch;
  const { client, controller, states } = fixture(initial);
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  TestWebSocket.instances[0].frame(ready);
  await until(() => states.at(-1) === "connected");
  const loadingKey = ["chats", "timeline", "chat-loading", 50];
  const observer = new InfiniteQueryObserver(client, {
    queryKey: loadingKey, structuralSharing: preserveLiveTimeline,
    initialPageParam: { pageSize: 50, order: "sequence" } as ListTimelineParams,
    queryFn: async () => { requests++; await gate; return page([182]); },
    getNextPageParam: () => undefined,
  });
  const unsubscribe = observer.subscribe(() => {});
  cleanups.push(unsubscribe);
  TestWebSocket.instances[0].frame(event(183, "chat-loading"));
  release();
  await until(() => client.getQueryData<TimelineData>(loadingKey)?.liveMessages?.length === 1);
  const data = client.getQueryData<TimelineData>(loadingKey)!;
  expect(mergeTimelinePages(data.pages, data.liveMessages).map((item) => item.sequence)).toEqual([182, 183]);
  expect(requests).toBe(2);
});

test("falha de atualização é repetida pelo backend e foco também invalida", async () => {
  let requests = 0;
  globalThis.fetch = (async (input) => {
    if (new URL(String(input)).pathname === "/v1/auth/session") return auth();
    requests++;
    return requests === 1 ? Response.json({ error: { code: "unavailable", message: "Unavailable" } }, { status: 503 }) : Response.json(page([183]));
  }) as typeof fetch;
  const { controller, states, documentEvents } = fixture(initial);
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  TestWebSocket.instances[0].frame(ready);
  await until(() => requests === 2 && states.at(-1) === "connected");
  documentEvents.dispatchEvent(new Event("visibilitychange"));
  await until(() => requests === 3 && states.at(-1) === "connected");
});

test("carregar histórico preserva eventos novos sem refetch da cauda", async () => {
  let requests = 0;
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    if (url.pathname === "/v1/auth/session") return auth();
    requests++;
    if (url.searchParams.has("beforeSequence")) { await gate; return Response.json(page([180])); }
    return Response.json(page([182], 182));
  }) as typeof fetch;
  const { client, controller, states, observer } = fixture({
    pages: [page([182], 182)], pageParams: [{ pageSize: 50, order: "sequence" }],
  });
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  TestWebSocket.instances[0].frame(ready);
  await until(() => states.at(-1) === "connected");
  const loading = observer.fetchNextPage();
  await until(() => requests === 2);
  TestWebSocket.instances[0].frame(event(183));
  release(); await loading;
  const data = client.getQueryData<TimelineData>(key)!;
  expect(mergeTimelinePages(data.pages, data.liveMessages).map((item) => item.sequence)).toEqual([180, 182, 183]);
  expect(requests).toBe(2);
  expect(data.pages[0].data.pagination.nextBeforeSequence).toBe(182);
  expect(states.at(-1)).toBe("connected");
});

test("nova conversa agrupa descoberta e não carrega timeline fechada", async () => {
  let listRequests = 0;
  globalThis.fetch = (async (input) => new URL(String(input)).pathname === "/v1/auth/session" ? auth() : Response.json(page([182]))) as typeof fetch;
  const { client, controller, states } = fixture(initial);
  const empty = { data: [], pagination: { page: 1, pageSize: 30, hasNext: false, nextCursor: null, totalItems: 0, totalPages: 0 } };
  const observer = new QueryObserver(client, {
    queryKey: ["chats", "list", 30], initialData: { pages: [empty], pageParams: [{ page: 1, pageSize: 30 }] },
    queryFn: async () => { listRequests++; return { pages: [empty], pageParams: [{ page: 1, pageSize: 30 }] }; },
  });
  const unsubscribe = observer.subscribe(() => {});
  cleanups.push(unsubscribe);
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  TestWebSocket.instances[0].frame(ready);
  await until(() => states.at(-1) === "connected");
  for (let i = 0; i < 5; i++) TestWebSocket.instances[0].frame(event(1, "new-chat"));
  await until(() => listRequests === 2);
  expect(client.getQueryData(["chats", "timeline", "new-chat", 50])).toBeUndefined();
  expect(states.at(-1)).toBe("connected");
});


test("janela histórica recebe aviso sem buscar lacunas ou alterar resultados da pesquisa", async () => {
  let timelineRequests = 0;
  globalThis.fetch = (async (input) => {
    if (new URL(String(input)).pathname === "/v1/auth/session") return auth();
    timelineRequests++;
    return Response.json(page([1000]));
  }) as typeof fetch;
  const { client, controller, states, observer } = fixture(initial);
  observer.setOptions({ ...observer.options, enabled: false });
  const contextData = page([75, 100, 125]);
  const historyKey = chatsQueryKeys.history("chat-1", 100);
  const historical = new QueryObserver(client, { queryKey: historyKey, initialData: contextData, queryFn: async () => { timelineRequests++; return contextData; } });
  const searchKey = chatsQueryKeys.messageSearch("chat-1", "contrato");
  const search = new QueryObserver(client, { queryKey: searchKey, initialData: contextData, queryFn: async () => { timelineRequests++; return contextData; } });
  const unsubscribeHistory = historical.subscribe(() => {});
  const unsubscribeSearch = search.subscribe(() => {});
  cleanups.push(unsubscribeHistory, unsubscribeSearch);
  const notification = ["chats", "history-notification", "chat-1"];
  client.setQueryData(notification, 0);
  controller.start();
  await until(() => TestWebSocket.instances.length === 1);
  const socket = TestWebSocket.instances[0];
  socket.frame(ready);
  await until(() => states.at(-1) === "connected");
  socket.frame(event(1001));
  socket.frame(event(1000));
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(timelineRequests).toBe(0);
  expect(client.getQueryData(notification)).toBe(1001);
  expect(client.getQueryData(historyKey)).toEqual(contextData);
  expect(client.getQueryData(searchKey)).toEqual(contextData);
});
