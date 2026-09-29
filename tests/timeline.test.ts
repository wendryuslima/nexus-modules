import { afterEach, expect, test } from "bun:test";

import { queryClient } from "../src/lib/query-client";
import { mergeTimelinePages } from "../src/lib/merge-timeline-pages";
import { createDirectChat } from "../src/services/chats/create-direct-chat";
import { listTimeline } from "../src/services/chats/list-timeline";
import type { TimelineItemDto } from "../src/types/chats/timeline-dto";

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
const timelineItem = (id: string, createdAt: string): TimelineItemDto => ({
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
        timelineItem("recent-1", "2026-09-27T10:00:00.000Z"),
        timelineItem("recent-2", "2026-09-27T11:00:00.000Z"),
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
        timelineItem("older-1", "2026-09-26T10:00:00.000Z"),
        timelineItem("older-2", "2026-09-26T11:00:00.000Z"),
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
