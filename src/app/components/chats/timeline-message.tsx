import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTimelineTime } from "@/lib/format-timeline-date";
import { getNameInitials } from "@/lib/get-name-initials";
import { cn } from "@/lib/utils";
import type { TimelineItemDto } from "@/types/chats/timeline-dto";

type TimelineMessageProps = {
  item: TimelineItemDto;
  participantName?: string;
  currentUserName?: string;
};

const TimelineMessage = ({
  item,
  participantName,
  currentUserName,
}: TimelineMessageProps) => {
  const senderName = item.message.isMine ? "Você" : (participantName ?? "Participante");
  const avatarName = item.message.isMine ? (currentUserName ?? "Eu") : senderName;
  const replyAuthorName =
    item.message.replyTo?.authorName === "Participante"
      ? (participantName ?? item.message.replyTo.authorName)
      : item.message.replyTo?.authorName;

  return (
    <article className="flex items-start gap-3" aria-label={`Mensagem de ${senderName}`}>
      <Avatar className="mt-0.5 size-10">
        <AvatarFallback
          className={cn(
            "text-xs font-semibold text-foreground",
            item.message.isMine ? "bg-secondary" : "bg-ice-deep",
          )}
        >
          {getNameInitials(avatarName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 max-w-[min(100%,42rem)]">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold">{senderName}</span>
          <time
            className="text-[0.65rem] text-muted-foreground"
            dateTime={item.createdAt}
            title={new Date(item.createdAt).toLocaleString("pt-BR")}
          >
            {formatTimelineTime(item.createdAt)}
          </time>
        </div>

        <div
          className={cn(
            "w-fit max-w-full text-sm leading-relaxed",
            item.message.isMine && "rounded-md bg-ice px-3 py-2",
          )}
        >
          {item.message.replyTo && (
            <blockquote className="mb-2 border-l-2 border-primary pl-2 text-xs text-muted-foreground">
              <span className="block font-medium text-primary">
                ↪ {replyAuthorName}
              </span>
              <span className="block truncate">{item.message.replyTo.content}</span>
            </blockquote>
          )}
          <p className="whitespace-pre-wrap break-words">{item.message.content.value}</p>
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
