import type { ChatReadState } from "@/types/chats/chat-read-state";
import type { MessageDto } from "@/types/chats/message-dto";
import type { PresenceSnapshotEvent, PresenceChangedEvent } from "@/types/users/user-presence";

type ReadyEvent = { version: 1; type: "connection.ready"; data: { connectionId: string; userId: string; accessExpiresAt: string } };
type MessageCreatedEvent = { version: 1; type: "message.created"; eventId: string; occurredAt: string; data: Omit<MessageDto, "deliveryStatus" | "clientMessageId"> & { clientMessageId?: string; chatState?: ChatReadState } };
type ChatReadEvent = { version: 1; type: "chat.read"; data: ChatReadState };
type RealtimeEvent = ReadyEvent | MessageCreatedEvent | ChatReadEvent | PresenceSnapshotEvent | PresenceChangedEvent;

class IncompatibleProtocolError extends Error {}
const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const date = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
const clientKey = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validContent = (content: unknown): boolean => {
  if (!record(content)) return false;
  if (content.type === "TEXT") return text(content.value) && content.imageId === undefined && content.caption === undefined;
  return content.type === "IMAGE" && text(content.imageId) && content.imageId.length <= 128 && content.value === undefined &&
    (content.caption === undefined || (typeof content.caption === "string" && [...content.caption].length <= 4000));
};

const validReply = (data: Record<string, unknown>): boolean => {
  if (data.replyID === undefined) return data.replyTo === undefined;
  const reply = data.replyTo;
  return text(data.replyID) && record(reply) && text(reply.senderId) &&
    Number.isSafeInteger(reply.sequence) && (reply.sequence as number) > 0 &&
    (reply.sequence as number) < (data.sequence as number) && validContent(reply.content);
};

const validChatState = (state: unknown): state is ChatReadState => record(state) && text(state.chatId) &&
  Number.isSafeInteger(state.unreadCount) && Number.isSafeInteger(state.lastReadSequence) && Number.isSafeInteger(state.lastSequence) &&
  (state.unreadCount as number) >= 0 && (state.lastReadSequence as number) >= 0 && (state.lastSequence as number) >= (state.lastReadSequence as number) &&
  (state.unreadCount as number) <= (state.lastSequence as number) - (state.lastReadSequence as number);

const parseRealtimeEvent = (raw: string): RealtimeEvent | null => {
  const event: unknown = JSON.parse(raw);
  if (!record(event)) throw new Error("Evento inválido.");
  if (event.version !== 1) throw new IncompatibleProtocolError("Atualize a aplicação para continuar recebendo mensagens em tempo real.");
  if (event.type !== "connection.ready" && event.type !== "message.created" && event.type !== "chat.read" && event.type !== "presence.snapshot" && event.type !== "presence.changed") return null;
  if (!record(event.data)) throw new Error("Dados do evento inválidos.");
  const data = event.data;
  if (event.type === "presence.snapshot") {
    if (!Array.isArray(data.userIds) || !data.userIds.every(text) || typeof data.complete !== "boolean") throw new Error("Presença inválida.");
    return event as PresenceSnapshotEvent;
  }
  if (event.type === "presence.changed") {
    if (!text(data.userId) || typeof data.online !== "boolean") throw new Error("Presença inválida.");
    return event as PresenceChangedEvent;
  }
  if (event.type === "chat.read") {
    if (!validChatState(data)) throw new Error("Contagem de mensagens inválida.");
    return event as ChatReadEvent;
  }
  if (event.type === "connection.ready") {
    if (!text(data.connectionId) || !text(data.userId) || !date(data.accessExpiresAt)) throw new Error("Prontidão inválida.");
  } else if (!text(event.eventId) || !date(event.occurredAt) || !text(data.id) || !text(data.chatId) || !text(data.senderId) || !date(data.createdAt) ||
    !Number.isSafeInteger(data.sequence) || (data.sequence as number) < 1 || !validContent(data.content) || !validReply(data) ||
    (data.chatState !== undefined && (!validChatState(data.chatState) || data.chatState.chatId !== data.chatId || data.chatState.lastSequence < (data.sequence as number))) ||
    (data.clientMessageId !== undefined && (typeof data.clientMessageId !== "string" || !clientKey.test(data.clientMessageId)))) {
    throw new Error("Mensagem recebida inválida.");
  }
  return event as RealtimeEvent;
};

export { parseRealtimeEvent, IncompatibleProtocolError };
export type { RealtimeEvent, MessageCreatedEvent };
