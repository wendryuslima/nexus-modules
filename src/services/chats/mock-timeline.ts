import type {
  ListTimelineParams,
  ListTimelineResponseDto,
  SendTimelineMessagePayload,
  TimelineItemDto,
} from "@/types/chats/timeline-dto";

const MOCK_REQUEST_DELAY = 350;
const timelines = new Map<string, TimelineItemDto[]>();

const dateAt = (daysAgo: number, hours: number, minutes: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const createMockTimeline = (chatId: string): TimelineItemDto[] => [
  {
    id: `${chatId}-message-1`,
    kind: "MESSAGE",
    createdAt: dateAt(1, 17, 42),
    updatedAt: dateAt(1, 17, 42),
    message: {
      senderId: "participant",
      isMine: false,
      content: { type: "TEXT", value: "Olá! Tudo bem por aí?" },
    },
  },
  {
    id: `${chatId}-message-2`,
    kind: "MESSAGE",
    createdAt: dateAt(0, 14, 31),
    updatedAt: dateAt(0, 14, 31),
    message: {
      senderId: "participant",
      isMine: false,
      content: {
        type: "TEXT",
        value:
          "Conseguiu finalizar aquela alteração?\n\nPrecisamos colocar em produção hoje.\n\nMe avisa quando estiver pronto.",
      },
    },
  },
  {
    id: `${chatId}-message-3`,
    kind: "MESSAGE",
    createdAt: dateAt(0, 14, 34),
    updatedAt: dateAt(0, 14, 34),
    message: {
      senderId: "current-user",
      isMine: true,
      replyTo: {
        authorName: "Participante",
        content: "Precisamos colocar em produção hoje.",
      },
      content: { type: "TEXT", value: "Já finalizei. Vou subir agora." },
      reactions: [
        { emoji: "👍", count: 3 },
        { emoji: "🎉", count: 2, reactedByMe: true },
        { emoji: "💗", count: 1 },
      ],
    },
  },
  {
    id: `${chatId}-message-4`,
    kind: "MESSAGE",
    createdAt: dateAt(0, 14, 36),
    updatedAt: dateAt(0, 14, 36),
    message: {
      senderId: "participant",
      isMine: false,
      content: { type: "TEXT", value: "Perfeito, pode subir. Obrigado!" },
    },
  },
];

const waitForMock = (signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Request aborted", "AbortError"));
      return;
    }

    const timeoutId = setTimeout(resolve, MOCK_REQUEST_DELAY);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeoutId);
        reject(signal.reason ?? new DOMException("Request aborted", "AbortError"));
      },
      { once: true },
    );
  });

const getTimeline = (chatId: string) => {
  const storedTimeline = timelines.get(chatId);
  if (storedTimeline) return storedTimeline;

  const timeline = createMockTimeline(chatId);
  timelines.set(chatId, timeline);
  return timeline;
};

const listMockTimeline = async (
  chatId: string,
  { pageSize, cursor }: ListTimelineParams,
  signal?: AbortSignal,
): Promise<ListTimelineResponseDto> => {
  await waitForMock(signal);

  const timeline = getTimeline(chatId);
  const cursorIndex = cursor
    ? timeline.findIndex((item) => item.id === cursor.id)
    : timeline.length;
  const endIndex = cursorIndex >= 0 ? cursorIndex : timeline.length;
  const startIndex = Math.max(0, endIndex - pageSize);
  const items = timeline.slice(startIndex, endIndex);
  const firstItem = items[0];

  return {
    data: {
      items,
      pagination: {
        hasNext: startIndex > 0,
        nextCursor:
          startIndex > 0 && firstItem
            ? { id: firstItem.id, createdAt: firstItem.createdAt }
            : null,
        pageSize,
      },
    },
  };
};

const sendMockTimelineMessage = async (
  chatId: string,
  payload: SendTimelineMessagePayload,
): Promise<TimelineItemDto> => {
  await waitForMock();

  const createdAt = new Date().toISOString();
  const item: TimelineItemDto = {
    id: `${chatId}-message-${crypto.randomUUID()}`,
    kind: "MESSAGE",
    createdAt,
    updatedAt: createdAt,
    message: {
      senderId: "current-user",
      isMine: true,
      content: { type: "TEXT", value: payload.content },
    },
  };

  getTimeline(chatId).push(item);
  return item;
};

export { listMockTimeline, sendMockTimelineMessage };
