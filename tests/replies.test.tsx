import { afterEach, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MessageReplyPreview } from "../src/app/components/chats/message-reply-preview";
import { TimelineMessage } from "../src/app/components/chats/timeline-message";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { createMessage } from "../src/services/chats/create-message";
import { parseRealtimeEvent, type MessageCreatedEvent } from "../src/services/realtime/protocol";
import { appendRealtimeMessage, preserveLiveTimeline, type TimelineViewData } from "../src/lib/realtime-view-data";
import { mergeTimelinePages } from "../src/lib/merge-timeline-pages";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const reply = { senderId: "other-user", sequence: 1, content: { type: "TEXT" as const, value: "Precisamos colocar em produção hoje." } };
const event: MessageCreatedEvent = {
  version: 1, type: "message.created", eventId: "event-100", occurredAt: "2026-11-11T12:00:00Z",
  data: { id: "message-100", chatId: "chat-1", sequence: 100, senderId: "me", content: { type: "TEXT", value: "Já finalizei." }, createdAt: "2026-11-11T12:00:00Z", replyID: "message-1", replyTo: reply },
};
const page = (): TimelineViewData => ({
  pages: [{ data: { items: [], snapshotThroughSequence: 99, pagination: { pageSize: 1, hasNext: true, nextCursor: null, nextBeforeSequence: 99 } } }],
  pageParams: [{ pageSize: 1, order: "sequence" }],
});

test("envio e retry preservam replyID no contrato HTTP", async () => {
  const payload = { clientMessageId: "018f92d4-2c47-7c87-b33e-d2ea331d2ff2", replyID: "message-1", content: { type: "TEXT" as const, value: "Resposta" } };
  let requests = 0;
  globalThis.fetch = (async (_input, init) => {
    expect(JSON.parse(String(init?.body))).toEqual(payload);
    requests++;
    return Response.json({ data: { ...event.data, clientMessageId: payload.clientMessageId, deliveryStatus: "PERSISTED" } }, { status: requests === 1 ? 201 : 200 });
  }) as typeof fetch;
  for (let i = 0; i < 2; i++) expect((await createMessage("chat-1", payload)).data.replyTo).toEqual(reply);
});

test("contexto fora da página permanece após socket, HTTP antigo, recarga e deduplicação", () => {
  expect(parseRealtimeEvent(JSON.stringify(event))).toEqual(event);
  const original = page();
  const live = appendRealtimeMessage(original, event, "me");
  const stale = preserveLiveTimeline(live, page());
  const [item] = mergeTimelinePages(stale.pages, stale.liveMessages);
  expect(item.message.replyID).toBe("message-1");
  expect(item.message.replyTo).toEqual(reply);
  expect(stale.pages[0].data.pagination).toEqual(original.pages[0].data.pagination);
  const fresh = page();
  fresh.pages[0].data.snapshotThroughSequence = 100;
  fresh.pages[0].data.items = [item];
  const reloaded = preserveLiveTimeline(stale, fresh);
  expect(mergeTimelinePages(reloaded.pages, reloaded.liveMessages)).toEqual([item]);
  expect(appendRealtimeMessage(reloaded, event, "me")).toBe(reloaded);
});

test("mensagens enviadas e recebidas exibem ação e autor da mensagem respondida", () => {
  for (const isMine of [true, false]) {
    const item = appendRealtimeMessage(page(), event, "me").liveMessages![0];
    item.message.isMine = isMine;
    const html = renderToStaticMarkup(<TooltipProvider><TimelineMessage item={item} participantName="Pablo" currentUserId="me" onReply={() => {}} /></TooltipProvider>);
    expect(html).toContain('aria-label="Responder mensagem"');
    expect(html).toContain("Pablo");
    expect(html).toContain(reply.content.value);
    expect(html).toContain(isMine ? "Mensagem enviada" : "Mensagem recebida");
  }
});

test("prévia de imagem sem legenda e fallback continuam legíveis", () => {
  expect(renderToStaticMarkup(<MessageReplyPreview authorName="Você" content={{ type: "IMAGE", imageId: "image-1" }} />)).toContain("Imagem");
  expect(renderToStaticMarkup(<MessageReplyPreview authorName="Mensagem original" />)).toContain("Mensagem indisponível");
});

test("realtime rejeita referência incompleta ou com sequência posterior", () => {
  for (const data of [
    { ...event.data, replyTo: undefined },
    { ...event.data, replyID: undefined },
    { ...event.data, replyTo: { ...reply, sequence: 101 } },
  ]) expect(() => parseRealtimeEvent(JSON.stringify({ ...event, data }))).toThrow();
});
