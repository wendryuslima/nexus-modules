import type { QueryClient } from "@tanstack/react-query";
import type { ChatReadState } from "@/types/chats/chat-read-state";
import type { ChatDto } from "@/types/chats/list-chats-dto";
import type { ChatsViewData } from "@/lib/realtime-view-data";

const newerReadState = (incoming: ChatReadState, previous: Pick<ChatReadState, "lastSequence" | "lastReadSequence">) =>
  incoming.lastSequence >= previous.lastSequence && incoming.lastReadSequence >= (previous.lastReadSequence ?? 0);

const updateChatReadState = (data: ChatsViewData, state: ChatReadState): ChatsViewData => {
  const chat = data.pages.flatMap((page) => page.data).find((chat) => chat.id === state.chatId);
  if (!chat || !newerReadState(state, data.readStates?.[state.chatId] ?? chat)) return data;
  return { ...data, readStates: { ...data.readStates, [state.chatId]: state } };
};

const applyChatReadState = (client: QueryClient, state: ChatReadState) => {
  for (const query of client.getQueryCache().findAll({ queryKey: ["chats"] })) {
    if (query.queryKey[1] === "list" || query.queryKey[1] === "search") {
      client.setQueryData<ChatsViewData>(query.queryKey, (data) => data && updateChatReadState(data, state));
    } else if (query.queryKey[1] === "detail" && query.queryKey[2] === state.chatId) {
      client.setQueryData<ChatDto>(query.queryKey, (chat) => chat && newerReadState(state, chat) ? { ...chat, ...state } : chat);
    }
  }
};

export { applyChatReadState, newerReadState, updateChatReadState };
