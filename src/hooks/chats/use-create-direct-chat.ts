import { useMutation, useQueryClient } from "@tanstack/react-query";

import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { createDirectChat } from "@/services/chats/create-direct-chat";
import type { CreateDirectChatRequestDto } from "@/types/chats/create-direct-chat-dto";

const useCreateDirectChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDirectChatRequestDto) => createDirectChat(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatsQueryKeys.lists() });
    },
  });
};

export { useCreateDirectChat };
