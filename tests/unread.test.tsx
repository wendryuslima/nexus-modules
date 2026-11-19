import { afterEach, expect, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { ChatListItem } from "../src/app/components/chats/chat-list-item";
import { applyChatReadState, updateChatReadState } from "../src/lib/chat-read-state";
import { preserveLiveChats, updateRealtimeChat, visibleChats, type ChatsViewData } from "../src/lib/realtime-view-data";
import { parseRealtimeEvent, type MessageCreatedEvent } from "../src/services/realtime/protocol";
import { markChatRead } from "../src/services/chats/mark-chat-read";
import type { ChatReadState } from "../src/types/chats/chat-read-state";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const now = "2026-11-16T12:00:00Z";
const state = (unreadCount = 2, lastReadSequence = 0, lastSequence = 2): ChatReadState => ({ chatId: "chat-1", unreadCount, lastReadSequence, lastSequence });
const list = (): ChatsViewData => ({
  pages: [{ data: [{ id: "chat-1", relatedUser: "other", relatedUserEmail: "other@example.com", createdAt: now, updatedAt: now, summarySortAt: now, ...state() }], pagination: { page: 1, pageSize: 30, hasNext: false, nextCursor: null } }],
  pageParams: [{ page: 1, pageSize: 30 }],
});
const message = (chatState: ChatReadState): MessageCreatedEvent => ({ version: 1, type: "message.created", eventId: "event-3", occurredAt: now, data: {
  id: "message-3", chatId: "chat-1", sequence: 3, senderId: "other", content: { type: "TEXT", value: "Olá" }, createdAt: now, chatState,
} });

test("contador usa o estado por participante e tolera eventos duplicados e fora de ordem", () => {
  let data = updateRealtimeChat(list(), message(state(3, 0, 3)));
  data = updateRealtimeChat(data, message(state(3, 0, 3)));
  expect(visibleChats(data)[0].unreadCount).toBe(3);
  data = updateChatReadState(data, state(0, 3, 3));
  data = updateRealtimeChat(data, message(state(3, 0, 3)));
  expect(visibleChats(data)[0].unreadCount).toBe(0);
  // The sender's authoritative state does not count their own new message.
  data = updateRealtimeChat(data, { ...message(state(0, 3, 4)), data: { ...message(state(0, 3, 4)).data, senderId: "me", sequence: 4 } });
  expect(visibleChats(data)[0].unreadCount).toBe(0);
});

test("HTTP antigo não restaura contador após leitura; HTTP atual incorpora o estado", () => {
  const read = updateChatReadState(list(), state(0, 2, 2));
  const stale = preserveLiveChats(read, list());
  expect(visibleChats(stale)[0].unreadCount).toBe(0);
  const fresh = list(); fresh.pages[0].data[0] = { ...fresh.pages[0].data[0], ...state(1, 2, 3) };
  const merged = preserveLiveChats(stale, fresh);
  expect(visibleChats(merged)[0].unreadCount).toBe(1);
  expect(merged.readStates?.["chat-1"]).toBeUndefined();
});

test("leitura sincroniza lista, pesquisa e detalhe sem alterar outras conversas", () => {
  const client = new QueryClient();
  for (const key of [["chats", "list", 30], ["chats", "search", "other"]]) client.setQueryData(key, list());
  client.setQueryData(["chats", "detail", "chat-1"], list().pages[0].data[0]);
  applyChatReadState(client, state(0, 2, 2));
  expect(visibleChats(client.getQueryData<ChatsViewData>(["chats", "list", 30])!)[0].unreadCount).toBe(0);
  expect(visibleChats(client.getQueryData<ChatsViewData>(["chats", "search", "other"])!, false)[0].unreadCount).toBe(0);
  expect(client.getQueryData<{ unreadCount: number }>(["chats", "detail", "chat-1"])?.unreadCount).toBe(0);
  client.clear();
});

test("protocolo valida contadores e aceita a notificação de leitura", () => {
  expect(parseRealtimeEvent(JSON.stringify({ version: 1, type: "chat.read", data: state(0, 2, 2) }))?.type).toBe("chat.read");
  for (const invalid of [state(-1), state(3), state(0, 3, 2), state(1.5)]) {
    expect(() => parseRealtimeEvent(JSON.stringify({ version: 1, type: "chat.read", data: invalid }))).toThrow();
  }
  expect(() => parseRealtimeEvent(JSON.stringify(message({ ...state(3, 0, 3), chatId: "foreign" })))).toThrow();
});

test("marcação envia apenas a sequência carregada e permite cancelar na navegação", async () => {
  const abort = new AbortController();
  globalThis.fetch = (async (url, init) => {
    expect(String(url)).toContain("/v1/chats/chat%2F1/read");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(init?.signal).toBe(abort.signal);
    expect(JSON.parse(String(init?.body))).toEqual({ throughSequence: 2 });
    return Response.json({ data: state(0, 2, 2) });
  }) as typeof fetch;
  expect((await markChatRead("chat/1", 2, abort.signal)).data.unreadCount).toBe(0);
});

test("badge oculta zero, mostra quantidade e limita visualmente a 99+", () => {
  const render = (count: number) => renderToStaticMarkup(<MemoryRouter><ChatListItem chat={{ ...list().pages[0].data[0], unreadCount: count }} name="Pablo" isActive={false} /></MemoryRouter>);
  expect(render(0)).not.toContain("mensagens não lidas");
  expect(render(2)).toContain('aria-label="2 mensagens não lidas"');
  expect(render(120)).toContain("99+");
  expect(render(120)).toContain('aria-label="120 mensagens não lidas"');
});
