import { afterEach, expect, test } from "bun:test";
import { parseRealtimeEvent, IncompatibleProtocolError } from "../src/services/realtime/protocol";
import { assertSessionGeneration, resumeSession, sessionGeneration, suspendSession } from "../src/services/auth/session-lifecycle";
import { refreshSession } from "../src/services/auth/refresh-session";
import type { TimelineItemDto } from "../src/types/chats/timeline-dto";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; resumeSession(); });

const item = (sequence: number): TimelineItemDto => ({
  id: `message-${sequence}`, sequence, kind: "MESSAGE", createdAt: "2026-10-27T12:00:00Z", updatedAt: "2026-10-27T12:00:00Z",
  message: { senderId: "sender-1", isMine: false, content: { type: "TEXT", value: "Olá" } },
});
test("protocolo aceita evento legado e rejeita versão ou sequência insegura", () => {
  const data = item(1);
  const event = { version: 1, type: "message.created", eventId: "event-1", occurredAt: data.createdAt,
    data: { id: data.id, chatId: "chat-1", sequence: 1, senderId: data.message.senderId, content: data.message.content, createdAt: data.createdAt } };
  expect(parseRealtimeEvent(JSON.stringify(event))?.type).toBe("message.created");
  expect(() => parseRealtimeEvent(JSON.stringify({ ...event, version: 2 }))).toThrow(IncompatibleProtocolError);
  expect(() => parseRealtimeEvent(JSON.stringify({ ...event, data: { ...event.data, sequence: 2 ** 53 } }))).toThrow();
  expect(parseRealtimeEvent(JSON.stringify({ version: 1, type: "future.event" }))).toBeNull();
});

test("logout invalida callbacks mesmo se a conta anterior ainda aparece no cache", () => {
  const previous = sessionGeneration();
  suspendSession();
  expect(() => assertSessionGeneration(previous)).toThrow();
});

test("acesso válido consulta sessão sem rotacionar refresh", async () => {
  const paths: string[] = [];
  globalThis.fetch = (async (input) => {
    paths.push(new URL(String(input)).pathname);
    return Response.json({ data: { user: { id: "user-1", email: "user@example.com" }, accessExpiresAt: "2099-01-01T00:00:00Z" } });
  }) as typeof fetch;
  expect((await refreshSession()).user?.id).toBe("user-1");
  expect(paths).toEqual(["/v1/auth/session"]);
});

test("falha de rede na consulta não provoca tentativa de refresh", async () => {
  let requests = 0;
  globalThis.fetch = (async () => { requests++; throw new TypeError("network unavailable"); }) as typeof fetch;
  await expect(refreshSession()).rejects.toThrow("network unavailable");
  expect(requests).toBe(1);
});
