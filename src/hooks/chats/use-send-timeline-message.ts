import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { createMessage } from "@/services/chats/create-message";
import type { CreateMessageRequestDto } from "@/types/chats/message-dto";
import type { ListTimelineParams, ListTimelineResponseDto, TimelineItemDto } from "@/types/chats/timeline-dto";

const TIMELINE_PAGE_SIZE = 50;

const useSendTimelineMessage = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMessageRequestDto) => createMessage(chatId, payload),
    onSuccess: ({ data: message }) => {
      const queryKey = chatsQueryKeys.timeline(chatId, TIMELINE_PAGE_SIZE);
      const item: TimelineItemDto = {
        id: message.id,
        kind: "MESSAGE",
        createdAt: message.createdAt,
        updatedAt: message.createdAt,
        message: {
          senderId: message.senderId,
          isMine: true,
          content: message.content,
        },
      };

      queryClient.setQueryData<InfiniteData<ListTimelineResponseDto, ListTimelineParams>>(
        queryKey,
        (current) => {
          if (!current?.pages.length) return current;
          if (current.pages.some((page) => page.data.items.some((existing) => existing.id === item.id))) {
            return current;
          }

          const [latestPage, ...olderPages] = current.pages;
          return {
            ...current,
            pages: [
              {
                ...latestPage,
                data: {
                  ...latestPage.data,
                  items: [...latestPage.data.items, item],
                },
              },
              ...olderPages,
            ],
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: chatsQueryKeys.lists() });
    },
  });
};

export { useSendTimelineMessage };
