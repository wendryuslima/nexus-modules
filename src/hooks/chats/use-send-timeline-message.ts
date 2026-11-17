import { useMutation } from "@tanstack/react-query";
import { createMessage } from "@/services/chats/create-message";
import { assertSessionGeneration, sessionGeneration } from "@/services/auth/session-lifecycle";
import type { CreateMessageRequestDto } from "@/types/chats/message-dto";
import { uploadImage } from "@/services/images/upload-image";

type TimelineMessageDraft = {
  replyID?: string;
  clientMessageId: string;
  text: string;
  image?: { file: File; clientUploadId: string };
};

const useSendTimelineMessage = (chatId: string) => {
  return useMutation({
    mutationFn: async (draft: TimelineMessageDraft) => {
      const generation = sessionGeneration();
      // A changed reply is a new logical message, even when it reuses the same file.
      const image = draft.image ? await uploadImage({ chatId, ...draft.image, clientUploadId: draft.clientMessageId }) : undefined;
      assertSessionGeneration(generation);
      const payload: CreateMessageRequestDto = {
        clientMessageId: draft.clientMessageId,
        replyID: draft.replyID,
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
