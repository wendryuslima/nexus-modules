import { afterEach, expect, test } from "bun:test";
import { listChats } from "../src/services/chats/list-chats";
import { listTimeline } from "../src/services/chats/list-timeline";
import { resumeSession } from "../src/services/auth/session-lifecycle";
import { getSearchHighlights } from "../src/lib/search-highlights";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; resumeSession(); });

test("destaques preservam acentos, Unicode decomposto e posições após emojis", () => {
  const text = "🙂 Olá, OLA! AÇÃO e ac\u0327a\u0303o.";
  const highlights = getSearchHighlights(text, "ola acao");
  expect(highlights.map(({ start, end }) => text.slice(start, end))).toEqual(["Olá", "OLA", "AÇÃO", "ac\u0327a\u0303o"]);
  expect(highlights[0].start).toBe(3);
});

test("destaques usam palavras completas, exigem todos os termos e separam pontuação", () => {
  const text = "Contratos e contrato de ANA.SILVA@example.com";
  expect(getSearchHighlights(text, "contrato ana.silva").map(({ start, end }) => text.slice(start, end))).toEqual(["contrato", "ANA", "SILVA"]);
  expect(getSearchHighlights(text, "contra")).toEqual([]);
  expect(getSearchHighlights(text, "contrato ausente")).toEqual([]);
});

test("busca vazia ou sem palavras não destaca mensagens", () => {
  for (const query of ["", "   ", ".*+?[]"]) {
    expect(getSearchHighlights("Olá!", query)).toEqual([]);
  }
});

test("busca de conversas preserva termo, cursor e cancelamento", async () => {
  const controller = new AbortController();
  globalThis.fetch = (async (input, init) => {
    const url = new URL(String(input));
    expect(url.pathname).toBe("/v1/chats");
    expect(url.searchParams.get("q")).toBe("Ana Silva");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("cursorId")).toBe("chat-7");
    expect(url.searchParams.get("cursorSortAt")).toBe("2026-01-01T00:00:00Z");
    expect(init?.signal).toBe(controller.signal);
    return Response.json({ data: [], pagination: { hasNext: false } });
  }) as typeof fetch;
  await listChats({ page: 2, pageSize: 30, query: "Ana Silva", cursor: { id: "chat-7", sortAt: "2026-01-01T00:00:00Z" } }, controller.signal);
});

test("paginação da busca de mensagens preserva o snapshot sem percorrer a timeline", async () => {
  const calls: URL[] = [];
  globalThis.fetch = (async (input) => {
    calls.push(new URL(String(input)));
    return Response.json({ data: { items: [], pagination: { hasNext: false } } });
  }) as typeof fetch;
  await listTimeline("chat/+?", { pageSize: 20, order: "sequence", query: "contrato ação", beforeSequence: 845, throughSequence: 1000 });
  expect(calls).toHaveLength(1);
  expect(calls[0].pathname).toBe("/v1/chats/chat%2F%2B%3F/timeline");
  expect(Object.fromEntries(calls[0].searchParams)).toEqual({ pageSize: "20", order: "sequence", q: "contrato ação", beforeSequence: "845", throughSequence: "1000" });
});

test("abrir ocorrência antiga faz uma única consulta por âncora", async () => {
  const calls: URL[] = [];
  globalThis.fetch = (async (input) => { calls.push(new URL(String(input))); return Response.json({ data: { items: [], pagination: { hasNext: false } } }); }) as typeof fetch;
  await listTimeline("chat-1", { pageSize: 51, order: "sequence", aroundSequence: 100 });
  expect(calls).toHaveLength(1);
  expect(Object.fromEntries(calls[0].searchParams)).toEqual({ pageSize: "51", order: "sequence", aroundSequence: "100" });
});
