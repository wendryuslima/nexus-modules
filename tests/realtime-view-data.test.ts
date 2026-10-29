import { expect, test } from "bun:test";
import { appendRealtimeMessage, preserveLiveChats, preserveLiveTimeline, timelineThroughSequence, updateRealtimeChat, visibleChats, type ChatsViewData, type TimelineViewData } from "../src/lib/realtime-view-data";
import { mergeTimelinePages } from "../src/lib/merge-timeline-pages";
import type { MessageCreatedEvent } from "../src/services/realtime/protocol";

const createdAt = "2026-10-28T12:00:00Z";
const event = (sequence: number, chatId = "chat-1", senderId = "user-1"): MessageCreatedEvent => ({
  version: 1, type: "message.created", eventId: `event-${sequence}`, occurredAt: createdAt,
  data: { id: `message-${sequence}`, sequence, chatId, senderId, createdAt, content: { type: "TEXT", value: `Mensagem ${sequence}` } },
});
const timeline = (snapshot: number): TimelineViewData => ({
  pages: [{ data: { items: [], snapshotThroughSequence: snapshot, pagination: { pageSize: 50, hasNext: true, nextBeforeSequence: 10, nextCursor: null } } }],
  pageParams: [{ pageSize: 50, order: "sequence" }],
});
const chats = (sequence = 1): ChatsViewData => ({
  pages: [{
    data: [
      { id: "chat-2", relatedUser: "user-2", relatedUserEmail: "second@example.com", lastSequence: 1, createdAt, updatedAt: createdAt, summarySortAt: "2026-10-27T12:00:00Z" },
      { id: "chat-1", relatedUser: "user-3", relatedUserEmail: "first@example.com", lastSequence: sequence, createdAt, updatedAt: createdAt, summarySortAt: sequence >= 2 ? createdAt : "2026-10-26T12:00:00Z" },
    ],
    pagination: { page: 1, pageSize: 30, totalItems: 2, totalPages: 1, hasNext: false, nextCursor: null },
  }],
  pageParams: [{ page: 1, pageSize: 30 }],
});

test("socket deduplica IDs, mantém a paginação e deriva isMine da sessão", () => {
  const original = timeline(10);
  const updated = appendRealtimeMessage(original, event(11), "user-1");
  const duplicate = appendRealtimeMessage(updated, event(11), "user-1");
  const other = appendRealtimeMessage(duplicate, event(12, "chat-1", "user-2"), "user-1");
  expect(original.liveMessages).toBeUndefined();
  expect(duplicate).toBe(updated);
  expect(other.liveMessages?.map((item) => item.message.isMine)).toEqual([true, false]);
  expect(other.pages).toBe(original.pages);
  expect(other.pageParams).toBe(original.pageParams);
});

test("eventos fora de ordem não avançam o ponto de recuperação sobre lacunas", () => {
  const missing = appendRealtimeMessage(timeline(10), event(12), "user-1");
  expect(timelineThroughSequence(missing)).toBe(10);
  expect(timelineThroughSequence(appendRealtimeMessage(missing, event(11), "user-1"))).toBe(12);
});

test("HTTP anterior preserva mensagem do socket; snapshot atualizado descarta a sobreposição", () => {
  const live = appendRealtimeMessage(timeline(10), event(11), "user-1");
  const stale = preserveLiveTimeline(live, timeline(10));
  expect(mergeTimelinePages(stale.pages, stale.liveMessages).map((item) => item.sequence)).toEqual([11]);
  const fresh = timeline(11);
  fresh.pages[0].data.items = [...live.liveMessages!];
  const result = preserveLiveTimeline(stale, fresh);
  expect(result.liveMessages).toEqual([]);
  expect(mergeTimelinePages(result.pages, result.liveMessages).map((item) => item.sequence)).toEqual([11]);
});

test("evento antigo não reintroduz mensagem fora da cauda já carregada", () => {
  const original = timeline(100);
  expect(appendRealtimeMessage(original, event(11), "user-1")).toBe(original);
});

test("lista muda de posição pelo evento sem alterar os cursores HTTP", () => {
  const original = chats();
  const updated = updateRealtimeChat(original, event(2));
  expect(visibleChats(original)[0].id).toBe("chat-2");
  expect(visibleChats(updated)[0]).toMatchObject({ id: "chat-1", lastSequence: 2, summarySortAt: createdAt });
  expect(updated.pages).toBe(original.pages);
  expect(updateRealtimeChat(updated, event(2))).toBe(updated);
  expect(updateRealtimeChat(updated, { ...event(1), data: { ...event(1).data, createdAt: "2026-10-25T12:00:00Z" } })).toBe(updated);
});

test("resposta HTTP antiga não reverte posição da conversa atualizada pelo socket", () => {
  const live = preserveLiveChats(chats(), updateRealtimeChat(chats(), event(2)));
  const stale = preserveLiveChats(live, chats());
  expect(visibleChats(stale)[0]).toMatchObject({ id: "chat-1", lastSequence: 2 });
  const fresh = preserveLiveChats(stale, chats(2));
  expect(fresh.liveUpdates).toEqual({});
  expect(visibleChats(fresh)[0].id).toBe("chat-1");
});
