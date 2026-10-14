import { afterEach, expect, test } from "bun:test";

import { authQueryKeys } from "../src/hooks/auth/auth-query-keys";
import { queryClient } from "../src/lib/query-client";
import { formatChatDate } from "../src/lib/format-chat-date";
import { listChats } from "../src/services/chats/list-chats";
import { listUsers } from "../src/services/users/list-users";

const originalFetch = globalThis.fetch;
const firstPage = { page: 1, pageSize: 30 };
const emptyPage = {
  data: [],
  pagination: {
    hasNext: false,
    nextCursor: null,
    page: 1,
    pageSize: 30,
    totalItems: 0,
    totalPages: 0,
  },
};
const unauthorized = () => Response.json({
  error: { code: "unauthenticated", message: "Faça login para continuar." },
}, { status: 401 });

afterEach(() => {
  globalThis.fetch = originalFetch;
  queryClient.clear();
});

test("primeira página envia cookies, sem corpo, Content-Type ou cursor", async () => {
  globalThis.fetch = (async (input, init) => {
    const url = new URL(String(input));
    expect(url.pathname).toBe("/v1/chats");
    expect([...url.searchParams.entries()]).toEqual([["page", "1"], ["pageSize", "30"]]);
    expect(init?.credentials).toBe("include");
    expect(init?.method).toBe("GET");
    expect(init?.body).toBeUndefined();
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false);
    return Response.json(emptyPage);
  }) as typeof fetch;
  expect(await listChats(firstPage)).toEqual(emptyPage);
});

test("página seguinte preserva exatamente o cursor RFC 3339 e a ordem recebida", async () => {
  const cursor = { id: "chat/+?", sortAt: "2026-09-20T18:30:00.123456789+00:00" };
  const response = { ...emptyPage, data: [{ id: "b" }, { id: "a" }] };
  globalThis.fetch = (async (input) => {
    const params = new URL(String(input)).searchParams;
    expect(params.get("page")).toBe("2");
    expect(params.getAll("cursorId")).toEqual([cursor.id]);
    expect(params.getAll("cursorSortAt")).toEqual([cursor.sortAt]);
    return Response.json(response);
  }) as typeof fetch;
  expect(await listChats({ ...firstPage, page: 2, cursor })).toEqual(response);
});

test("usuários usam página limitada e preservam o cursor de criação", async () => {
  const cursor = { id: "user/+?", createdAt: "2026-10-04T03:22:12.916Z" };
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    expect(url.pathname).toBe("/v1/users");
    expect([...url.searchParams.entries()]).toEqual([
      ["page", "2"], ["pageSize", "30"],
      ["cursorId", cursor.id], ["cursorCreatedAt", cursor.createdAt],
    ]);
    return Response.json({ data: [], pagination: { ...emptyPage.pagination, page: 2 } });
  }) as typeof fetch;
  await listUsers({ page: 2, pageSize: 30, cursor });
});

test("erros de negócio preservam a mensagem retornada pelo servidor", async () => {
  globalThis.fetch = (async () => Response.json({
    error: { code: "invalid_pagination", message: "Cursor expirado na consulta." },
  }, { status: 400 })) as typeof fetch;
  await expect(listChats(firstPage)).rejects.toMatchObject({
    code: "invalid_pagination", message: "Cursor expirado na consulta.", status: 400,
  });
});

test("chats e usuários compartilham uma renovação de sessão simultânea", async () => {
  let refreshes = 0;
  let releaseRefresh: () => void = () => {};
  const refreshGate = new Promise<void>((resolve) => { releaseRefresh = resolve; });
  const requests = new Map<string, number>();
  globalThis.fetch = (async (input) => {
    const path = new URL(String(input)).pathname;
    if (path === "/v1/auth/refresh") {
      refreshes++;
      await refreshGate;
      return new Response(null, { status: 204 });
    }
    const count = (requests.get(path) ?? 0) + 1;
    requests.set(path, count);
    if (count === 1) return unauthorized();
    return Response.json(path === "/v1/chats" ? emptyPage : { data: [] });
  }) as typeof fetch;
  const pending = Promise.all([listChats(firstPage), listUsers()]);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(refreshes).toBe(1);
  releaseRefresh();
  await pending;
  expect(requests.get("/v1/chats")).toBe(2);
  expect(requests.get("/v1/users")).toBe(2);
});

test("a requisição original é repetida no máximo uma vez", async () => {
  let requests = 0;
  let refreshes = 0;
  globalThis.fetch = (async (input) => {
    if (new URL(String(input)).pathname === "/v1/auth/refresh") {
      refreshes++;
      return new Response(null, { status: 204 });
    }
    requests++;
    return unauthorized();
  }) as typeof fetch;
  await expect(listChats(firstPage)).rejects.toMatchObject({ status: 401 });
  expect(requests).toBe(2);
  expect(refreshes).toBe(1);
});

test("refresh recusado limpa dados privados e encerra a sessão local", async () => {
  queryClient.setQueryData(["chats", "list", 30], emptyPage);
  queryClient.setQueryData(authQueryKeys.session(), { isAuthenticated: true, user: null });
  globalThis.fetch = (async () => unauthorized()) as typeof fetch;
  await expect(listChats(firstPage)).rejects.toMatchObject({ status: 401 });
  expect(queryClient.getQueryData(["chats", "list", 30])).toBeUndefined();
  expect(queryClient.getQueryData(authQueryKeys.session())).toEqual({ isAuthenticated: false, user: null });
});

test("encaminha o sinal de cancelamento ao cliente HTTP", async () => {
  const controller = new AbortController();
  globalThis.fetch = (async (_input, init) => {
    expect(init?.signal).toBe(controller.signal);
    return Response.json(emptyPage);
  }) as typeof fetch;
  await listChats(firstPage, controller.signal);
});

test("datas consideram o dia local, a virada do mês e o ano", () => {
  const now = new Date(2026, 0, 1, 12, 0);
  expect(formatChatDate(new Date(2026, 0, 1, 9, 5).toISOString(), now)).toBe("09:05");
  expect(formatChatDate(new Date(2025, 11, 31, 20, 0).toISOString(), now)).toBe("Ontem");
  expect(formatChatDate(new Date(2025, 11, 30, 20, 0).toISOString(), now)).toBe("30/12/2025");
});
