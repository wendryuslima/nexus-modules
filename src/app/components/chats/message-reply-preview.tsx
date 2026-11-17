import { Reply } from "lucide-react";
import type { MessageContentDto } from "@/types/chats/message-dto";

type MessageReplyPreviewProps = {
  authorName: string;
  content?: MessageContentDto;
};

const MessageReplyPreview = ({ authorName, content }: MessageReplyPreviewProps) => (
  <blockquote className="min-w-0 border-l-2 border-primary pl-2 text-xs">
    <span className="flex items-center gap-1 font-medium text-primary">
      <Reply aria-hidden="true" className="size-3 shrink-0" />
      <span className="truncate">{authorName}</span>
    </span>
    <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap break-words text-muted-foreground">
      {!content ? "Mensagem indisponível" : content.type === "TEXT" ? content.value : content.caption ? `Imagem: ${content.caption}` : "Imagem"}
    </p>
  </blockquote>
);

export { MessageReplyPreview };
