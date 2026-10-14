import { MessageCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";

import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { MessageComposer } from "@/app/components/chats/message-composer";
import { TimelineDayDivider } from "@/app/components/chats/timeline-day-divider";
import { TimelineHeader } from "@/app/components/chats/timeline-header";
import { TimelineMessage } from "@/app/components/chats/timeline-message";
import { TimelineSkeleton } from "@/app/components/chats/timeline-skeleton";
import { Button } from "@/components/ui/button";
import { useTimeline } from "@/hooks/chats/use-timeline";
import { useTimelineScroll } from "@/hooks/chats/use-timeline-scroll";
import { calendarDayKey, formatTimelineDate } from "@/lib/format-timeline-date";
import { mergeTimelinePages } from "@/lib/merge-timeline-pages";

type ChatTimelineProps = {
  chatId: string;
  participantName?: string;
  currentUserName?: string;
};

const ChatTimeline = ({
  chatId,
  participantName = "Participante",
  currentUserName,
}: ChatTimelineProps) => {
  const timeline = useTimeline(chatId);
  const { scrollContainerRef, loadOlderMessages } = useTimelineScroll({
    chatId,
    isTimelineLoaded: Boolean(timeline.data),
    fetchOlderMessages: timeline.fetchNextPage,
  });
  const items = useMemo(
    () => (timeline.data ? mergeTimelinePages(timeline.data.pages) : []),
    [timeline.data],
  );
  const latestItem = items.at(-1);

  useEffect(() => {
    if (!latestItem?.message.isMine) return;

    requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [latestItem?.id, latestItem?.message.isMine, scrollContainerRef]);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <TimelineHeader participantName={participantName} />

      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto"
        aria-live="polite"
      >
        {timeline.isPending && <TimelineSkeleton />}

        {timeline.error && !timeline.data && (
          <div className="mx-auto max-w-lg space-y-3 px-5 py-8">
            <RequestErrorAlert message={timeline.error.message} />
            <Button variant="outline" onClick={() => timeline.refetch()} disabled={timeline.isFetching}>
              <RefreshCw aria-hidden="true" className="size-4" />
              Tentar novamente
            </Button>
          </div>
        )}

        {timeline.data && (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-4 py-6 sm:px-8 sm:py-8">
            {timeline.hasNextPage && !timeline.isFetchNextPageError && (
              <Button
                variant="ghost"
                className="mx-auto text-primary"
                onClick={loadOlderMessages}
                disabled={timeline.isFetchingNextPage}
              >
                {timeline.isFetchingNextPage ? "Carregando..." : "Carregar mensagens anteriores"}
              </Button>
            )}

            {timeline.isFetchNextPageError && timeline.error && (
              <div className="space-y-2">
                <RequestErrorAlert message={timeline.error.message} />
                <Button variant="outline" size="sm" onClick={loadOlderMessages}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {items.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                  <MessageCircle aria-hidden="true" className="size-6" />
                </span>
                <h3 className="font-heading text-lg font-semibold">Nenhuma mensagem ainda</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comece a conversa enviando uma mensagem abaixo.
                </p>
              </div>
            )}

            {items.map((item, index) => {
              const currentDay = calendarDayKey(new Date(item.createdAt));
              const previousItem = items[index - 1];
              const previousDay = previousItem
                ? calendarDayKey(new Date(previousItem.createdAt))
                : null;

              return (
                <div key={item.id} className="contents">
                  {currentDay !== previousDay && (
                    <TimelineDayDivider label={formatTimelineDate(item.createdAt)} />
                  )}
                  <TimelineMessage
                    item={item}
                    participantName={participantName}
                    currentUserName={currentUserName}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MessageComposer key={chatId} chatId={chatId} participantName={participantName} />
    </section>
  );
};

export { ChatTimeline };
