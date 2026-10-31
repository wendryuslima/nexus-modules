import { afterEach, expect, test } from "bun:test";
import { uploadImage } from "../src/services/images/upload-image";
import { getImageAccess } from "../src/services/images/get-image-access";
import { createMessage } from "../src/services/chats/create-message";
import { parseRealtimeEvent } from "../src/services/realtime/protocol";
import { appendRealtimeMessage } from "../src/lib/realtime-view-data";
import { resumeSession } from "../src/services/auth/session-lifecycle";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; resumeSession(); });

test("upload usa multipart com os IDs estáveis e mantém erros do servidor", async () => {
  const file = new File(["image-bytes"], "image.png", { type: "image/png" });
  const requests: RequestInit[] = [];
  globalThis.fetch = (async (_url, init) => {
    requests.push(init ?? {});
    return Response.json({ data: { id: "image-1", contentType: "image/png", sizeBytes: 11, width: 2, height: 2 } });
  }) as typeof fetch;
  const input = { chatId: "chat-1", clientUploadId: "upload-1", file };
  expect((await uploadImage(input)).id).toBe("image-1");
  await uploadImage(input);
  for (const request of requests) {
    expect(request.credentials).toBe("include");
    expect(request.headers).toBeUndefined(); // The browser supplies the multipart boundary.
    expect(request.body).toBeInstanceOf(FormData);
    const body = request.body as FormData;
    expect(body.get("clientUploadId")).toBe("upload-1");
    expect(body.get("chatId")).toBe("chat-1");
    expect((body.get("file") as File).name).toBe("image.png");
  }
  globalThis.fetch = (async () => Response.json({ error: { code: "invalid_image", message: "Mensagem exata do servidor." } }, { status: 422 })) as typeof fetch;
  await expect(uploadImage(input)).rejects.toThrow("Mensagem exata do servidor.");
});

test("mensagem de imagem envia referência e legenda; acesso é obtido separadamente", async () => {
  const requests: { path: string; init?: RequestInit }[] = [];
  const content = { type: "IMAGE" as const, imageId: "image-1", caption: "Legenda 🙂" };
  globalThis.fetch = (async (url, init) => {
    requests.push({ path: new URL(String(url)).pathname, init });
    return Response.json({ data: { id: "message-1", content, url: "https://storage.example/signed", expiresAt: "2099-01-01T00:00:00Z" } });
  }) as typeof fetch;
  await createMessage("chat-1", { clientMessageId: "message-key", content });
  expect(JSON.parse(String(requests[0].init?.body))).toEqual({ clientMessageId: "message-key", content });
  const controller = new AbortController();
  await getImageAccess("image/id", controller.signal);
  expect(requests[1].path).toBe("/v1/images/image%2Fid/access");
  expect(requests[1].init?.signal).toBe(controller.signal);
  expect(requests[1].init?.body).toBeUndefined();
});

test("realtime aceita imagens, recupera sem duplicar e rejeita conteúdo misturado", () => {
  const event = {
    version: 1, type: "message.created", eventId: "event-1", occurredAt: "2026-10-31T12:00:00Z",
    data: { id: "message-1", chatId: "chat-1", sequence: 1, senderId: "sender", createdAt: "2026-10-31T12:00:00Z",
      content: { type: "IMAGE", imageId: "image-1", caption: "Olá" } },
  };
  const parsed = parseRealtimeEvent(JSON.stringify(event));
  if (parsed?.type !== "message.created") throw new Error("Expected message");
  const view = { pages: [{ data: { snapshotThroughSequence: 0, items: [], pagination: { hasNext: false, nextCursor: null, pageSize: 50 } } }], pageParams: [{ pageSize: 50 }] };
  const updated = appendRealtimeMessage(view, parsed, "recipient");
  expect(updated.liveMessages?.[0].message.content).toEqual(event.data.content);
  expect(appendRealtimeMessage(updated, parsed, "recipient").liveMessages).toHaveLength(1);
  for (const content of [
    { type: "IMAGE", imageId: "" }, { type: "IMAGE", imageId: "image-1", value: "text" },
    { type: "IMAGE", imageId: "image-1", caption: 1 }, { type: "TEXT", value: "text", imageId: "image-1" },
  ]) expect(() => parseRealtimeEvent(JSON.stringify({ ...event, data: { ...event.data, content } }))).toThrow();
});
