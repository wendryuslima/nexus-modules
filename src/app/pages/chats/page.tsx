import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { ChatListItem } from "@/app/components/chats/chat-list-item";
import { ChatPlaceholder } from "@/app/components/chats/chat-placeholder";
import { ChatTimeline } from "@/app/components/chats/chat-timeline";
import { ChatsListSkeleton } from "@/app/components/chats/chats-list-skeleton";
import { AppShell } from "@/app/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { useChats } from "@/hooks/chats/use-chats";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getUserDisplayName } from "@/lib/get-user-display-name";
import { cn } from "@/lib/utils";

const ChatsPage = () => {
  const session = useAuthSession();
  const chats = useChats();
  const { chatId } = useParams<{ chatId: string }>();

  const loadedChats = chats.data?.pages.flatMap((page) => page.data) ?? [];
  const { scrollAreaRef, sentinelRef } = useInfiniteScroll({
    hasNextPage: Boolean(chats.hasNextPage),
    isFetchingNextPage: chats.isFetchingNextPage,
    isFetchNextPageError: chats.isFetchNextPageError,
    itemCount: loadedChats.length,
    fetchNextPage: chats.fetchNextPage,
  });
  const selectedChat = loadedChats.find((chat) => chat.id === chatId);
  const selectedUserEmail = selectedChat?.relatedUserEmail;

  return (
    <AppShell currentUserEmail={session.data?.user?.email ?? null}>
      <SidebarInset className="h-dvh min-w-0 overflow-hidden">
        <div className="flex min-h-0 flex-1">
          <aside aria-label="Conversas" className={cn(
            "min-h-0 w-full shrink-0 flex-col border-r bg-card md:flex md:w-80",
            chatId ? "hidden" : "flex",
          )}>
            <header className="flex h-[4.5rem] shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="md:hidden" aria-label="Abrir menu principal" />
              <h1 className="min-w-0 flex-1 text-lg font-semibold">Conversas</h1>
              <Button variant="ghost" size="icon-sm" render={<Link to="/people" />} nativeButton={false} aria-label="Encontrar pessoas" title="Encontrar pessoas">
                <MessageSquarePlus aria-hidden="true" className="size-4" />
              </Button>
            </header>

            <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1" aria-busy={chats.isFetching}>
              <div className="px-2 pb-4">
              <h2 className="px-3 pb-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">Recentes</h2>
              {chats.isPending && <ChatsListSkeleton />}
              <ul className="space-y-0.5">
                {loadedChats.map((chat) => {
                  return <ChatListItem key={chat.id} chat={chat} name={chat.relatedUserEmail ? getUserDisplayName(chat.relatedUserEmail) : "Participante"} isActive={chat.id === chatId} />;
                })}
              </ul>
              {chats.error && (
                <div className="mx-2 mt-3 space-y-2">
                  <RequestErrorAlert message={chats.error.message} />
                  <Button variant="outline" size="sm" onClick={() => chats.isFetchNextPageError ? chats.fetchNextPage() : chats.refetch()} disabled={chats.isFetching}>Tentar novamente</Button>
                </div>
              )}
              {!chats.isPending && !chats.error && loadedChats.length === 0 && (
                <p role="status" className="px-3 py-6 text-sm text-muted-foreground">
                  Você ainda não tem conversas.
                </p>
              )}
              {chats.isFetchingNextPage && <p role="status" className="px-3 py-3 text-xs text-muted-foreground">Carregando conversas...</p>}
              <div ref={sentinelRef} aria-hidden="true" className="h-px" />
              </div>
            </ScrollArea>
          </aside>

          <div className={cn("min-w-0 flex-1 flex-col md:flex", chatId ? "flex" : "hidden")}>
            {chatId && (
              <div className="border-b p-2 md:hidden">
                <Button variant="ghost" render={<Link to="/chats" />} nativeButton={false}>
                  <ArrowLeft aria-hidden="true" className="size-4" /> Voltar às conversas
                </Button>
              </div>
            )}
            {chatId ? (
              <ChatTimeline
                chatId={chatId}
                participantName={selectedUserEmail ? getUserDisplayName(selectedUserEmail) : undefined}
              />
            ) : (
              <ChatPlaceholder />
            )}
          </div>
        </div>
      </SidebarInset>
    </AppShell>
  );
};

export default ChatsPage;
