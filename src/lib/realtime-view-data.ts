import type { InfiniteData } from "@tanstack/react-query";
import type { ChatDto, ListChatsParams, ListChatsResponseDto } from "@/types/chats/list-chats-dto";
import type { ListTimelineParams, ListTimelineResponseDto, TimelineItemDto } from "@/types/chats/timeline-dto";
import type { MessageCreatedEvent } from "@/services/realtime/protocol";

type TimelineViewData = InfiniteData<ListTimelineResponseDto, ListTimelineParams> & {
  liveMessages?: TimelineItemDto[];
};

type ChatUpdate = { sequence: number; createdAt: string };
type ChatsViewData = InfiniteData<ListChatsResponseDto, ListChatsParams> & {
  liveUpdates?: Record<string, ChatUpdate>;
};

const uniqueMessages = (items: readonly TimelineItemDto[]) => {
  const byId = new Map<string, TimelineItemDto>();
  for (const item of items) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
};

const timelineThroughSequence = (data: TimelineViewData): number | undefined => {
  let through = data.pages[0]?.data.snapshotThroughSequence;
  if (through === undefined) return undefined;
  for (const item of uniqueMessages(data.liveMessages ?? [])) {
    if (item.sequence === through + 1) through = item.sequence;
  }
  return through;
};

const preserveLiveTimeline = (oldData: unknown, newData: unknown): TimelineViewData => {
  const previous = oldData as TimelineViewData | undefined;
  const incoming = newData as TimelineViewData;
  const through = incoming.pages[0]?.data.snapshotThroughSequence;
  const liveMessages = uniqueMessages([...(previous?.liveMessages ?? []), ...(incoming.liveMessages ?? [])])
    .filter((item) => through === undefined || item.sequence > through);
  return { ...incoming, liveMessages };
};

const appendRealtimeMessage = (data: TimelineViewData, event: MessageCreatedEvent, userId: string): TimelineViewData => {
  const message = event.data;
  const snapshot = data.pages[0]?.data.snapshotThroughSequence;
  if (snapshot !== undefined && message.sequence <= snapshot) return data;
  if (data.pages.some((page) => page.data.items.some((item) => item.id === message.id)) ||
    data.liveMessages?.some((item) => item.id === message.id)) return data;
  return {
    ...data,
    liveMessages: uniqueMessages([...(data.liveMessages ?? []), {
      id: message.id, sequence: message.sequence, kind: "MESSAGE",
      createdAt: message.createdAt, updatedAt: message.createdAt,
      message: {
        clientMessageId: message.clientMessageId, senderId: message.senderId,
        isMine: message.senderId === userId, content: message.content,
      },
    }]),
  };
};

const later = (left: string, right: string) => Date.parse(left) >= Date.parse(right) ? left : right;
const compareChats = (left: ChatDto, right: ChatDto) =>
  Date.parse(right.summarySortAt) - Date.parse(left.summarySortAt) || right.id.localeCompare(left.id);

const preserveLiveChats = (oldData: unknown, newData: unknown): ChatsViewData => {
  const previous = oldData as ChatsViewData | undefined;
  const incoming = newData as ChatsViewData;
  const updates: Record<string, ChatUpdate> = { ...(previous?.liveUpdates ?? {}) };
  for (const [id, update] of Object.entries(incoming.liveUpdates ?? {})) {
    const existing = updates[id];
    updates[id] = existing
      ? { sequence: Math.max(existing.sequence, update.sequence), createdAt: later(existing.createdAt, update.createdAt) }
      : update;
  }
  for (const page of incoming.pages) {
    for (const chat of page.data) {
      const update = updates[chat.id];
      if (update && chat.lastSequence >= update.sequence && Date.parse(chat.summarySortAt) >= Date.parse(update.createdAt)) delete updates[chat.id];
    }
  }
  return { ...incoming, liveUpdates: updates };
};

const visibleChats = (data: ChatsViewData): ChatDto[] => {
  const chats = new Map<string, ChatDto>();
  for (const page of data.pages) {
    for (const chat of page.data) {
      const update = data.liveUpdates?.[chat.id];
      chats.set(chat.id, update ? {
        ...chat, lastSequence: Math.max(chat.lastSequence, update.sequence),
        summarySortAt: later(chat.summarySortAt, update.createdAt),
      } : chat);
    }
  }
  return [...chats.values()].sort(compareChats);
};

const updateRealtimeChat = (data: ChatsViewData, event: MessageCreatedEvent): ChatsViewData => {
  const message = event.data;
  const chat = visibleChats(data).find((item) => item.id === message.chatId);
  if (!chat || (chat.lastSequence >= message.sequence && Date.parse(chat.summarySortAt) >= Date.parse(message.createdAt))) return data;
  return {
    ...data,
    liveUpdates: {
      ...data.liveUpdates,
      [message.chatId]: {
        sequence: Math.max(chat.lastSequence, message.sequence),
        createdAt: later(chat.summarySortAt, message.createdAt),
      },
    },
  };
};

export { appendRealtimeMessage, preserveLiveTimeline, timelineThroughSequence, preserveLiveChats, updateRealtimeChat, visibleChats };
export type { TimelineViewData, ChatsViewData };
