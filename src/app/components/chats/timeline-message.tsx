import { formatTimelineTime } from "@/lib/format-timeline-date";
import { cn } from "@/lib/utils";
import type { TimelineItemDto } from "@/types/chats/timeline-dto";

type TimelineMessageProps = {
  item: TimelineItemDto;
  participantName?: string;
};

const TimelineMessage = ({ item, participantName }: TimelineMessageProps) => {
  const senderName = item.message.isMine ? "Você" : (participantName ?? "Participante");

  return (
    <article
      className={cn("flex flex-col", item.message.isMine ? "items-end" : "items-start")}
      aria-label={`Mensagem de ${senderName}`}
    >
      <div className="mb-1 flex items-baseline gap-2 px-1">
        <span className="text-sm font-semibold">{senderName}</span>
        <time
          className="text-[0.65rem] text-muted-foreground"
          dateTime={item.createdAt}
          title={new Date(item.createdAt).toLocaleString("pt-BR")}
        >
          {formatTimelineTime(item.createdAt)}
        </time>
      </div>
      <p
        className={cn(
          "max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%]",
          item.message.isMine
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm border bg-card text-card-foreground",
        )}
      >
        {item.message.content.value}
      </p>
    </article>
  );
};

export { TimelineMessage };
