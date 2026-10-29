import { useMutation } from "@tanstack/react-query";
import { createMessage } from "@/services/chats/create-message";
import { assertSessionGeneration, sessionGeneration } from "@/services/auth/session-lifecycle";
import type { CreateMessageRequestDto } from "@/types/chats/message-dto";

const useSendTimelineMessage = (chatId: string) => {
  return useMutation({
    mutationFn: async (payload: CreateMessageRequestDto) => {
      const generation = sessionGeneration();
      await createMessage(chatId, payload);
      assertSessionGeneration(generation);
      return { generation };
    },
  });
};

export { useSendTimelineMessage };
