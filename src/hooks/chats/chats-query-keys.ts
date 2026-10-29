const chatsQueryKeys = {
  all: () => ["chats"] as const,
  lists: () => [...chatsQueryKeys.all(), "list"] as const,
  list: (pageSize: number) => [...chatsQueryKeys.lists(), pageSize] as const,
  timelines: () => [...chatsQueryKeys.all(), "timeline"] as const,
  timelineForChat: (chatId: string) =>
    [...chatsQueryKeys.timelines(), chatId] as const,
  timeline: (chatId: string, pageSize: number) =>
    [...chatsQueryKeys.timelineForChat(chatId), pageSize] as const,
};

export { chatsQueryKeys };
