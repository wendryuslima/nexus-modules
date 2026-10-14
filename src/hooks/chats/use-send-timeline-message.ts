import { useMutation, useQueryClient } from "@tanstack/react-query";

import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { sendMockTimelineMessage } from "@/services/chats/mock-timeline";
import type { SendTimelineMessagePayload } from "@/types/chats/timeline-dto";

const TIMELINE_PAGE_SIZE = 50;

const useSendTimelineMessage = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendTimelineMessagePayload) =>
      sendMockTimelineMessage(chatId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatsQueryKeys.timeline(chatId, TIMELINE_PAGE_SIZE),
      });
    },
  });
};

export { useSendTimelineMessage };
