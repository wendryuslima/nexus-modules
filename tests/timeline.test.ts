import { afterEach, expect, test } from "bun:test";
import { QueryObserver } from "@tanstack/react-query";

import { queryClient } from "../src/lib/query-client";
import { mergeTimelinePages } from "../src/lib/merge-timeline-pages";
import { invalidateBackendQuery } from "../src/lib/invalidate-backend-query";
import { createDirectChat } from "../src/services/chats/create-direct-chat";
import { createMessage } from "../src/services/chats/create-message";
import { listTimeline } from "../src/services/chats/list-timeline";
import type { TimelineItemDto } from "../src/types/chats/timeline-dto";
import { resumeSession } from "../src/services/auth/session-lifecycle";

const originalFetch = globalThis.fetch;
const chat = {
  id: "chat-id",
  relatedUser: "user-id",
  createdAt: "2026-09-27T00:00:00.000Z",
  updatedAt: "2026-09-27T00:00:00.000Z",
  summarySortAt: "2026-09-27T00:00:00.000Z",
};
const emptyTimeline = {
  data: {
    items: [],
    pagination: { hasNext: false, nextCursor: null, pageSize: 50 },
  },
};
const timelineItem = (id: string, createdAt: string, sequence = 1): TimelineItemDto => ({
  sequence,
  id,
  kind: "MESSAGE",
  createdAt,
  updatedAt: createdAt,
  message: {
    senderId: "user-id",
    isMine: false,
    content: { type: "TEXT", value: id },
  },
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  queryClient.clear();
  resumeSession();
});

test("cria mensagem com ID idempotente e aceita resposta de retry", async () => {
  const payload = {
    clientMessageId: "018f92d4-2c47-7c87-b33e-d2ea331d2ff2",
    content: { type: "TEXT" as const, value: "Olá!" },
  };
  const persisted = {
    id: "message-id",
    clientMessageId: payload.clientMessageId,
    chatId: "chat/+?",
    sequence: 1,
    senderId: "user-id",
    content: payload.content,
    createdAt: "2026-10-13T12:00:00Z",
    deliveryStatus: "PERSISTED",
  };

  globalThis.fetch = (async (input, init) => {
    expect(new URL(String(input)).pathname).toBe("/v1/chats/chat%2F%2B%3F/messages");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(init?.body))).toEqual(payload);
    return Response.json({ data: persisted }, { status: 200 });
  }) as typeof fetch;

  expect(await createMessage("chat/+?", payload)).toEqual({ data: persisted });
});

test("cria ou recupera o chat direto enviando somente o usuário relacionado", async () => {
  globalThis.fetch = (async (input, init) => {
    const url = new URL(String(input));
    expect(url.pathname).toBe("/v1/chats/direct");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(init?.body))).toEqual({ relatedUserId: "user-id" });
    return Response.json({ data: chat });
  }) as typeof fetch;

  expect(await createDirectChat({ relatedUserId: "user-id" })).toEqual({ data: chat });
});

test("carrega a primeira página da timeline pelo chatId sem cursor ou corpo", async () => {
  globalThis.fetch = (async (input, init) => {
    const url = new URL(String(input));
    expect(url.pathname).toBe("/v1/chats/chat-id/timeline");
    expect([...url.searchParams.entries()]).toEqual([["pageSize", "50"]]);
    expect(init?.method).toBe("GET");
    expect(init?.cache).toBe("no-store");
    expect(init?.credentials).toBe("include");
    expect(init?.body).toBeUndefined();
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false);
    return Response.json(emptyTimeline);
  }) as typeof fetch;

  expect(await listTimeline("chat-id", { pageSize: 50 })).toEqual(emptyTimeline);
});

test("codifica o path param e preserva exatamente os dois campos do cursor", async () => {
  const cursor = {
    id: "message/+?",
    createdAt: "2026-09-27T00:03:46.056+00:00",
  };

  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    expect(url.pathname).toBe("/v1/chats/chat%2F%2B%3F/timeline");
    expect(url.searchParams.getAll("cursorId")).toEqual([cursor.id]);
    expect(url.searchParams.getAll("cursorCreatedAt")).toEqual([cursor.createdAt]);
    return Response.json(emptyTimeline);
  }) as typeof fetch;

  await listTimeline("chat/+?", { pageSize: 50, cursor });
});

test("encaminha o cancelamento da navegação para a requisição da timeline", async () => {
  const controller = new AbortController();
  globalThis.fetch = (async (_input, init) => {
    expect(init?.signal).toBe(controller.signal);
    return Response.json(emptyTimeline);
  }) as typeof fetch;

  await listTimeline("chat-id", { pageSize: 50 }, controller.signal);
});

test("insere páginas antigas antes das recentes sem reordenar os itens da página", () => {
  const recentPage = {
    data: {
      items: [
        timelineItem("recent-1", "2026-09-27T10:00:00.000Z", 3),
        timelineItem("recent-2", "2026-09-27T11:00:00.000Z", 4),
      ],
      pagination: {
        hasNext: true,
        nextCursor: { id: "recent-1", createdAt: "2026-09-27T10:00:00.000Z" },
        pageSize: 50,
      },
    },
  };
  const olderPage = {
    data: {
      items: [
        timelineItem("older-1", "2026-09-26T10:00:00.000Z", 1),
        timelineItem("older-2", "2026-09-26T11:00:00.000Z", 2),
      ],
      pagination: { hasNext: false, nextCursor: null, pageSize: 50 },
    },
  };

  expect(mergeTimelinePages([recentPage, olderPage]).map((item) => item.id)).toEqual([
    "older-1",
    "older-2",
    "recent-1",
    "recent-2",
  ]);
});

test("queries sem observadores são descartadas e reabrir a tela consulta novamente", async () => {
  const key = ["chats", "timeline", "discard-on-unmount", 50];
  let requests = 0;
  const options = { queryKey: key, queryFn: async () => ++requests };
  const first = new QueryObserver(queryClient, options);
  const unsubscribe = first.subscribe(() => {});
  try {
    await first.refetch();
    expect(first.getCurrentResult().data).toBe(1);
  } finally {
    unsubscribe();
  }
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(queryClient.getQueryData(key)).toBeUndefined();
  const second = new QueryObserver(queryClient, options);
  const unsubscribeSecond = second.subscribe(() => {});
  try {
    expect(second.getCurrentResult().data).toBeUndefined();
    await second.refetch();
    expect(second.getCurrentResult().data).toBe(2);
  } finally {
    unsubscribeSecond();
  }
});

test("recuperação durante carga inicial exige uma leitura HTTP posterior", async () => {
  let requests = 0;
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  globalThis.fetch = (async () => {
    const request = ++requests;
    if (request === 1) await gate;
    return Response.json({ data: { ...emptyTimeline.data, items: request === 1 ? [] : [timelineItem("persisted", "2026-10-28T12:00:00Z")] } });
  }) as typeof fetch;
  const key = ["chats", "timeline", "chat-id", 50];
  const observer = new QueryObserver(queryClient, {
    queryKey: key, queryFn: ({ signal }) => listTimeline("chat-id", { pageSize: 50 }, signal),
  });
  const unsubscribe = observer.subscribe(() => {});
  try {
    const update = invalidateBackendQuery(queryClient, key, () => true);
    release();
    await update;
    expect(requests).toBe(2);
    expect(observer.getCurrentResult().data?.data.items.map((item) => item.id)).toEqual(["persisted"]);
  } finally {
    unsubscribe();
  }
});
