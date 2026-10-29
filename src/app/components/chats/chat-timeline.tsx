import { MessageCircle, RefreshCw } from "lucide-react";
import { useMemo } from "react";

import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { MessageComposer } from "@/app/components/chats/message-composer";
import { TimelineDayDivider } from "@/app/components/chats/timeline-day-divider";
import { TimelineHeader } from "@/app/components/chats/timeline-header";
import { TimelineMessage } from "@/app/components/chats/timeline-message";
import { TimelineSkeleton } from "@/app/components/chats/timeline-skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTimeline } from "@/hooks/chats/use-timeline";
import { useTimelineScroll } from "@/hooks/chats/use-timeline-scroll";
import { calendarDayKey, formatTimelineDate } from "@/lib/format-timeline-date";
import { mergeTimelinePages } from "@/lib/merge-timeline-pages";
import { useRealtimeStatus } from "@/hooks/chats/use-realtime-status";

type ChatTimelineProps = {
  chatId: string;
  participantName?: string;
};

const ChatTimeline = ({
  chatId,
  participantName = "Participante",
}: ChatTimelineProps) => {
  const timeline = useTimeline(chatId);
  const realtimeStatus = useRealtimeStatus();
  const items = useMemo(
    () => (timeline.data ? mergeTimelinePages(timeline.data.pages, timeline.data.liveMessages) : []),
    [timeline.data],
  );
  const latestItem = items.at(-1);
  const { scrollContainerRef, loadOlderMessages, newMessages, scrollToLatest } = useTimelineScroll({
    chatId,
    isTimelineLoaded: Boolean(timeline.data),
    fetchOlderMessages: timeline.fetchNextPage,
    latestItemId: latestItem?.id,
    latestItemIsMine: latestItem?.message.isMine,
  });

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <TimelineHeader participantName={participantName} />
      {realtimeStatus !== "connected" && (
        <p role="status" className="border-b px-4 py-2 text-center text-xs text-muted-foreground">
          {realtimeStatus === "syncing" ? "Sincronizando mensagens..." :
            realtimeStatus === "offline" ? "Sem conexão. Verifique a rede antes de tentar enviar novamente." :
            realtimeStatus === "incompatible" ? "Atualize a página para continuar recebendo mensagens em tempo real." :
            realtimeStatus === "stopped" ? "Atualização em tempo real interrompida. Recarregue a página para tentar novamente." : "Reconectando..."}
        </p>
      )}

      <ScrollArea
        viewportRef={scrollContainerRef}
        className="min-h-0 flex-1"
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
          <div className="flex w-full flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8">
            {timeline.isRefetchError && (
              <div className="space-y-2">
                <RequestErrorAlert message="Não foi possível atualizar as mensagens pelo servidor." />
                <Button variant="outline" size="sm" onClick={() => timeline.refetch()} disabled={timeline.isFetching}>
                  Tentar novamente
                </Button>
              </div>
            )}
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
                  <TimelineMessage item={item} />
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {newMessages && <Button variant="secondary" className="mx-auto my-2" onClick={scrollToLatest}>Novas mensagens ↓</Button>}
      <MessageComposer key={chatId} chatId={chatId} participantName={participantName} />
    </section>
  );
};

export { ChatTimeline };
