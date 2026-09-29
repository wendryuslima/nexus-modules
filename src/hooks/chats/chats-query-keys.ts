const chatsQueryKeys = {
  all: () => ["chats"] as const,
  lists: () => [...chatsQueryKeys.all(), "list"] as const,
  list: (pageSize: number) => [...chatsQueryKeys.lists(), pageSize] as const,
  timeline: (chatId: string, pageSize: number) =>
    [...chatsQueryKeys.all(), "timeline", chatId, pageSize] as const,
};

export { chatsQueryKeys };
