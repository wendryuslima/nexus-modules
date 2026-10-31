import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ImagePlus, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSendTimelineMessage, type TimelineMessageDraft } from "@/hooks/chats/use-send-timeline-message";
import { ApiError } from "@/services/http/api-error";
import { ImageAttachmentPreview } from "@/app/components/chats/image-attachment-preview";

type MessageComposerProps = {
  chatId: string;
  participantName: string;
};

const MessageComposer = ({ chatId, participantName }: MessageComposerProps) => {
  const descriptionId = useId();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<TimelineMessageDraft["image"]>();
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const retryPayload = useRef<TimelineMessageDraft | null>(null);
  const sendMessage = useSendTimelineMessage(chatId);
  const canSend = (message.trim().length > 0 || Boolean(image)) && !sendMessage.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = message.trim();
    if ((!content && !image) || sendMessage.isPending) return;

    const previous = retryPayload.current;
    const payload: TimelineMessageDraft =
      previous?.text === content && previous.image === image
        ? previous
        : { clientMessageId: crypto.randomUUID(), text: content, image };
    retryPayload.current = payload;

    inputRef.current?.focus({ preventScroll: true });

    sendMessage.mutate(
      payload,
      {
        onSuccess: () => {
          retryPayload.current = null;
          setMessage((current) => current.trim() === content ? "" : current);
          setImage((current) => current === image ? undefined : current);
          if (fileRef.current) fileRef.current.value = "";
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === "idempotency_conflict") {
            retryPayload.current = null;
          }
          if (error instanceof ApiError && ["image_unavailable", "image_upload_expired"].includes(error.code)) {
            retryPayload.current = null;
            setImage((current) => current ? { ...current, clientUploadId: crypto.randomUUID() } : current);
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
    <footer className="shrink-0 bg-background p-3 pb-6 sm:px-6">
      <form
        className="w-full rounded-3xl border bg-card transition-shadow focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20"
        onSubmit={handleSubmit}
      >
        {image && <div className="flex items-center gap-3 border-b p-3">
          <ImageAttachmentPreview file={image.file} />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{image.file.name}</span>
          <Button type="button" variant="ghost" size="icon" aria-label="Remover imagem" disabled={sendMessage.isPending} onClick={() => {
            setImage(undefined);
            retryPayload.current = null;
            sendMessage.reset();
            if (fileRef.current) fileRef.current.value = "";
          }}><X aria-hidden="true" /></Button>
        </div>}
        <div className="flex items-end gap-1 p-1.5 sm:gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="sr-only" tabIndex={-1} aria-label="Selecionar imagem" disabled={sendMessage.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setImage({ file, clientUploadId: crypto.randomUUID() });
              retryPayload.current = null;
              sendMessage.reset();
            }} />
          <Button type="button" variant="ghost" size="icon-lg" className="rounded-full text-muted-foreground" disabled={sendMessage.isPending} aria-label="Anexar imagem" title="Anexar imagem JPEG ou PNG (até 10 MiB)" onClick={() => fileRef.current?.click()}>
            <ImagePlus aria-hidden="true" className="size-5" />
          </Button>
          <ScrollArea className="min-w-0 flex-1" viewportClassName="max-h-44">
            <Textarea
              ref={inputRef}
              value={message}
              readOnly={sendMessage.isPending}
              onChange={(event) => {
                setMessage(event.target.value);
                if (retryPayload.current && event.target.value.trim() !== retryPayload.current.text) {
                  retryPayload.current = null;
                  setImage((current) => current ? { ...current, clientUploadId: crypto.randomUUID() } : current);
                  sendMessage.reset();
                }
              }}
              onKeyDown={handleKeyDown}
              aria-label={`Mensagem para ${participantName}`}
              aria-describedby={descriptionId}
              placeholder={image ? "Adicionar legenda (opcional)" : "Digite uma mensagem"}
              rows={1}
              className="min-h-9 resize-none overflow-hidden rounded-none border-0 bg-transparent py-2 pr-3 pl-1 leading-5 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
            />
          </ScrollArea>
          <Button
            type="submit"
            size="icon-lg"
            className="rounded-full"
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
      <p id={descriptionId} className="sr-only">
        Enter para enviar · Shift + Enter para nova linha · JPEG ou PNG até 10 MiB
      </p>
    </footer>
  );
};

export { MessageComposer };
