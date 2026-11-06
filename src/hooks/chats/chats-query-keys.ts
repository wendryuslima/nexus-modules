const chatsQueryKeys = {
  all: () => ["chats"] as const,
  search: (query: string) => ["chats", "search", query] as const,
  detail: (chatId: string) => ["chats", "detail", chatId] as const,
  messageSearch: (chatId: string, query: string) => ["chats", "message-search", chatId, query] as const,
  history: (chatId: string, anchor: number | undefined) => ["chats", "history", chatId, anchor] as const,
  lists: () => [...chatsQueryKeys.all(), "list"] as const,
  list: (pageSize: number) => [...chatsQueryKeys.lists(), pageSize] as const,
  timelines: () => [...chatsQueryKeys.all(), "timeline"] as const,
  timelineForChat: (chatId: string) =>
    [...chatsQueryKeys.timelines(), chatId] as const,
  timeline: (chatId: string, pageSize: number) =>
    [...chatsQueryKeys.timelineForChat(chatId), pageSize] as const,
};

export { chatsQueryKeys };
