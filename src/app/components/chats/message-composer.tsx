import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendTimelineMessage } from "@/hooks/chats/use-send-timeline-message";
import { ApiError } from "@/services/http/api-error";
import type { CreateMessageRequestDto } from "@/types/chats/message-dto";

type MessageComposerProps = {
  chatId: string;
  participantName: string;
};

const MessageComposer = ({ chatId, participantName }: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const retryPayload = useRef<CreateMessageRequestDto | null>(null);
  const sendMessage = useSendTimelineMessage(chatId);
  const canSend = message.trim().length > 0 && !sendMessage.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || sendMessage.isPending) return;

    const previous = retryPayload.current;
    const payload: CreateMessageRequestDto =
      previous?.content.value === content
        ? previous
        : { clientMessageId: crypto.randomUUID(), content: { type: "TEXT", value: content } };
    retryPayload.current = payload;

    sendMessage.mutate(
      payload,
      {
        onSuccess: () => {
          retryPayload.current = null;
          setMessage((current) => current.trim() === content ? "" : current);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === "idempotency_conflict") {
            retryPayload.current = null;
          }
        },
      },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <footer className="shrink-0 border-t bg-background p-3 sm:px-6 sm:py-4">
      <form
        className="mx-auto max-w-4xl rounded-lg border bg-card transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20"
        onSubmit={handleSubmit}
      >
        <Textarea
          value={message}
          disabled={sendMessage.isPending}
          onChange={(event) => {
            setMessage(event.target.value);
            if (retryPayload.current && event.target.value.trim() !== retryPayload.current.content.value) {
              retryPayload.current = null;
              sendMessage.reset();
            }
          }}
          onKeyDown={handleKeyDown}
          aria-label={`Mensagem para ${participantName}`}
          placeholder={`Mensagem para ${participantName}`}
          rows={2}
          className="max-h-32 min-h-12 resize-none border-0 px-3 pt-3 pb-1 shadow-none focus-visible:border-transparent focus-visible:ring-0"
        />

        <div className="flex items-center gap-0.5 px-2 pb-2">
          <Button
            type="submit"
            size="icon-lg"
            className="ml-auto"
            disabled={!canSend}
            aria-label={sendMessage.isError ? "Tentar enviar novamente" : "Enviar mensagem"}
            title={sendMessage.isError ? "Tentar enviar novamente" : "Enviar mensagem"}
          >
            <Send aria-hidden="true" />
          </Button>
        </div>

        {sendMessage.error && (
          <p role="alert" className="px-3 pb-2 text-xs text-destructive">
            {sendMessage.error.message}
          </p>
        )}
      </form>
      <p className="mt-1.5 text-center text-[0.65rem] text-muted-foreground">
        Enter para enviar · Shift + Enter para nova linha
      </p>
    </footer>
  );
};

export { MessageComposer };
