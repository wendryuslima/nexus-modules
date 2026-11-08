import { MessageCircle, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { MessageComposer } from "@/app/components/chats/message-composer";
import { MessageSearch } from "@/app/components/chats/message-search";
import { TimelineDayDivider } from "@/app/components/chats/timeline-day-divider";
import { TimelineHeader } from "@/app/components/chats/timeline-header";
import { TimelineMessage } from "@/app/components/chats/timeline-message";
import { TimelineSkeleton } from "@/app/components/chats/timeline-skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTimeline } from "@/hooks/chats/use-timeline";
import { useTimelineContext } from "@/hooks/chats/use-timeline-context";
import { chatsQueryKeys } from "@/hooks/chats/chats-query-keys";
import { useTimelineScroll } from "@/hooks/chats/use-timeline-scroll";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
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
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchOpened, setSearchOpened] = useState(false);
  const messageQuery = (params.get("messageQuery") ?? "").trim();
  const rawAnchor = params.get("message");
  const anchor = rawAnchor && /^\d+$/.test(rawAnchor) && Number.isSafeInteger(Number(rawAnchor)) && Number(rawAnchor) > 0 ? Number(rawAnchor) : undefined;
  const searchOpen = searchOpened || params.has("messageQuery");
  const liveTimeline = useTimeline(chatId, anchor === undefined);
  const context = useTimelineContext(chatId, anchor);
  const timeline = anchor === undefined ? liveTimeline : context;
  const { data: latestNotifiedSequence } = useQuery({ queryKey: ["chats", "history-notification", chatId], initialData: 0, enabled: false, queryFn: () => 0 });
  const returnToLatest = () => {
    setSearchOpened(false);
    void queryClient.resetQueries({ queryKey: chatsQueryKeys.timelineForChat(chatId) });
    setParams((current) => { const next = new URLSearchParams(current); next.delete("message"); next.delete("messageQuery"); return next; });
  };
  const closeSearch = () => {
    setSearchOpened(false);
    setParams((current) => { const next = new URLSearchParams(current); next.delete("messageQuery"); return next; }, { replace: true });
  };
  const realtimeStatus = useRealtimeStatus();
  const items = useMemo(
    () => (timeline.data ? mergeTimelinePages(timeline.data.pages, anchor === undefined ? liveTimeline.data?.liveMessages : []) : []),
    [timeline.data, anchor, liveTimeline.data?.liveMessages],
  );
  const latestItem = items.at(-1);
  const { scrollContainerRef, loadOlderMessages, loadNewerMessages, newMessages, scrollToLatest } = useTimelineScroll({
    chatId: `${chatId}:${anchor ?? "latest"}`,
    anchorSequence: anchor,
    isTimelineLoaded: Boolean(timeline.data),
    fetchOlderMessages: timeline.fetchNextPage,
    fetchNewerMessages: context.fetchPreviousPage,
    latestItemId: latestItem?.id,
    latestItemIsMine: latestItem?.message.isMine,
  });
  const { scrollAreaRef, sentinelRef } = useInfiniteScroll({
    hasNextPage: Boolean(timeline.hasNextPage),
    isFetchingNextPage: timeline.isFetching,
    isFetchNextPageError: timeline.isFetchNextPageError,
    itemCount: items.length,
    fetchNextPage: loadOlderMessages,
    direction: "top",
  });
  const { sentinelRef: newerSentinelRef } = useInfiniteScroll({
    scrollAreaRef,
    hasNextPage: anchor !== undefined && Boolean(context.hasPreviousPage),
    isFetchingNextPage: context.isFetching,
    isFetchNextPageError: context.isFetchPreviousPageError,
    itemCount: items.length,
    fetchNextPage: loadNewerMessages,
    direction: "bottom",
  });

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <TimelineHeader participantName={participantName} onSearch={() => setSearchOpened(true)} searchOpen={searchOpen} />
      {searchOpen && <MessageSearch chatId={chatId} onClose={closeSearch} />}
      {rawAnchor && anchor === undefined && <div className="space-y-2 p-4"><RequestErrorAlert message="A referência da mensagem é inválida." /><Button size="sm" variant="outline" onClick={returnToLatest}>Ir às mais recentes</Button></div>}
      {anchor !== undefined && <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
        <span>{latestNotifiedSequence > (context.data?.pages[0]?.data.snapshotThroughSequence ?? latestNotifiedSequence) ? "Novas mensagens chegaram enquanto você consulta o histórico." : "Você está consultando o histórico da conversa."}</span>
        <Button size="sm" variant="outline" onClick={returnToLatest}>Ir às mais recentes</Button>
      </div>}
      {realtimeStatus !== "connected" && (
        <p role="status" className="border-b px-4 py-2 text-center text-xs text-muted-foreground">
          {realtimeStatus === "syncing" ? "Sincronizando mensagens..." :
            realtimeStatus === "offline" ? "Sem conexão. Verifique a rede antes de tentar enviar novamente." :
            realtimeStatus === "incompatible" ? "Atualize a página para continuar recebendo mensagens em tempo real." :
            realtimeStatus === "stopped" ? "Atualização em tempo real interrompida. Recarregue a página para tentar novamente." : "Reconectando..."}
        </p>
      )}

      <ScrollArea
        ref={scrollAreaRef}
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
          <div className="relative flex w-full flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8">
            {timeline.isRefetchError && (
              <div className="space-y-2">
                <RequestErrorAlert message="Não foi possível atualizar as mensagens pelo servidor." />
                <Button variant="outline" size="sm" onClick={() => timeline.refetch()} disabled={timeline.isFetching}>
                  Tentar novamente
                </Button>
              </div>
            )}
            {timeline.hasNextPage && !timeline.isFetchNextPageError && (
              <div ref={sentinelRef} aria-hidden="true" className="h-px" />
            )}
            {timeline.isFetchingNextPage && (
              <p role="status" className="absolute inset-x-0 top-1 z-10 mx-auto w-fit rounded bg-background/90 px-2 py-1 text-center text-sm text-muted-foreground">
                Carregando mensagens anteriores...
              </p>
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
                  <TimelineMessage item={item} highlighted={!messageQuery && item.sequence === anchor} searchQuery={messageQuery} />
                </div>
              );
            })}
            {anchor !== undefined && context.hasPreviousPage && !context.isFetchPreviousPageError && <div ref={newerSentinelRef} aria-hidden="true" className="h-px" />}
            {anchor !== undefined && context.isFetchingPreviousPage && <p role="status" className="text-center text-sm text-muted-foreground">Carregando mensagens posteriores...</p>}
            {anchor !== undefined && context.isFetchPreviousPageError && <div className="space-y-2"><RequestErrorAlert message={context.error?.message ?? "Não foi possível carregar as mensagens posteriores."} /><Button variant="outline" size="sm" disabled={context.isFetching} onClick={loadNewerMessages}>Tentar novamente</Button></div>}
          </div>
        )}
      </ScrollArea>

      {anchor === undefined && newMessages && <Button variant="secondary" className="mx-auto my-2" onClick={scrollToLatest}>Novas mensagens ↓</Button>}
      <MessageComposer key={chatId} chatId={chatId} participantName={participantName} />
    </section>
  );
};

export { ChatTimeline };
