import { formatTimelineTime } from "@/lib/format-timeline-date";
import { cn } from "@/lib/utils";
import type { TimelineItemDto } from "@/types/chats/timeline-dto";

type TimelineMessageProps = {
  item: TimelineItemDto;
};

const TimelineMessage = ({ item }: TimelineMessageProps) => {
  const isMine = item.message.isMine;

  return (
    <article
      className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}
      aria-label={isMine ? "Mensagem enviada" : "Mensagem recebida"}
    >
      <div className="flex max-w-[min(85%,42rem)] flex-col items-start">
        <div
          className={cn(
            "min-w-0 rounded-md px-3 py-2 text-sm leading-relaxed",
            isMine ? "bg-ice-deep text-foreground" : "bg-[#f3f4f6] text-foreground",
          )}
        >
          {item.message.replyTo && (
            <blockquote className="mb-2 border-l-2 border-primary pl-2 text-xs text-muted-foreground">
              <span className="block break-words">{item.message.replyTo.content}</span>
            </blockquote>
          )}
          <p className="whitespace-pre-wrap break-words">{item.message.content.value}</p>
          <time
            className="mt-1 block text-[0.65rem] text-muted-foreground"
            dateTime={item.createdAt}
            title={new Date(item.createdAt).toLocaleString("pt-BR")}
          >
            {formatTimelineTime(item.createdAt)}
          </time>
        </div>

        {item.message.reactions && item.message.reactions.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1" aria-label="Reações da mensagem">
            {item.message.reactions.map((reaction) => (
              <li key={reaction.emoji}>
                <button
                  type="button"
                  className={cn(
                    "flex h-6 items-center gap-1 rounded-full border bg-background px-2 text-xs transition-colors hover:bg-muted",
                    reaction.reactedByMe && "border-primary bg-secondary",
                  )}
                  aria-label={`${reaction.emoji}, ${reaction.count} reações`}
                >
                  <span aria-hidden="true">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
};

export { TimelineMessage };
