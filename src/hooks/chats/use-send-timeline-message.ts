import { useMutation } from "@tanstack/react-query";
import { createMessage } from "@/services/chats/create-message";
import { assertSessionGeneration, sessionGeneration } from "@/services/auth/session-lifecycle";
import type { CreateMessageRequestDto } from "@/types/chats/message-dto";
import { uploadImage } from "@/services/images/upload-image";

type TimelineMessageDraft = {
  clientMessageId: string;
  text: string;
  image?: { file: File; clientUploadId: string };
};

const useSendTimelineMessage = (chatId: string) => {
  return useMutation({
    mutationFn: async (draft: TimelineMessageDraft) => {
      const generation = sessionGeneration();
      const image = draft.image ? await uploadImage({ chatId, ...draft.image }) : undefined;
      assertSessionGeneration(generation);
      const payload: CreateMessageRequestDto = {
        clientMessageId: draft.clientMessageId,
        content: image
          ? { type: "IMAGE", imageId: image.id, caption: draft.text || undefined }
          : { type: "TEXT", value: draft.text },
      };
      await createMessage(chatId, payload);
      assertSessionGeneration(generation);
      return { generation };
    },
  });
};

export { useSendTimelineMessage };
export type { TimelineMessageDraft };
