import { formatTimelineTime } from "@/lib/format-timeline-date";
import { cn } from "@/lib/utils";
import { getSearchHighlights } from "@/lib/search-highlights";
import type { TimelineItemDto } from "@/types/chats/timeline-dto";
import { TimelineImage } from "@/app/components/chats/timeline-image";

type TimelineMessageProps = {
  item: TimelineItemDto;
  highlighted?: boolean;
  searchQuery?: string;
};

const SearchHighlight = ({ text, query }: { text: string; query: string }) => {
  const matches = getSearchHighlights(text, query);
  return <>{matches.map(({ start, end }, index) => {
    const before = text.slice(matches[index - 1]?.end ?? 0, start);
    return <span key={start}>{before}<mark className="rounded-sm bg-yellow-300 text-black">{text.slice(start, end)}</mark></span>;
  })}{text.slice(matches.at(-1)?.end ?? 0)}</>;
};

const TimelineMessage = ({ item, highlighted, searchQuery = "" }: TimelineMessageProps) => {
  const isMine = item.message.isMine;

  return (
    <article
      data-sequence={item.sequence}
      className={cn("flex w-full scroll-m-6 rounded-md", isMine ? "justify-end" : "justify-start", highlighted && "bg-primary/10 ring-2 ring-primary/60")}
      aria-label={isMine ? "Mensagem enviada" : "Mensagem recebida"}
    >
      <div className="flex max-w-[min(85%,42rem)] flex-col items-start">
        <div
          className={cn(
            "min-w-0 rounded-md px-3 py-2 text-sm leading-relaxed",
            isMine ? "bg-secondary text-foreground" : "bg-muted text-foreground",
          )}
        >
          {item.message.replyTo && (
            <blockquote className="mb-2 border-l-2 border-primary pl-2 text-xs text-muted-foreground">
              <span className="block break-words">{item.message.replyTo.content}</span>
            </blockquote>
          )}
          {item.message.content.type === "IMAGE" ? (
            <>
              <TimelineImage key={item.message.content.imageId} imageId={item.message.content.imageId} caption={item.message.content.caption} />
              {item.message.content.caption && <p className="mt-2 whitespace-pre-wrap break-words"><SearchHighlight text={item.message.content.caption} query={searchQuery} /></p>}
            </>
          ) : <p className="whitespace-pre-wrap break-words"><SearchHighlight text={item.message.content.value} query={searchQuery} /></p>}
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
