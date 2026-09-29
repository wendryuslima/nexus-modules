import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { ChatListItem } from "@/app/components/chats/chat-list-item";
import { ChatPlaceholder } from "@/app/components/chats/chat-placeholder";
import { ChatTimeline } from "@/app/components/chats/chat-timeline";
import { ChatsListSkeleton } from "@/app/components/chats/chats-list-skeleton";
import { AppShell } from "@/app/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { useChats } from "@/hooks/chats/use-chats";
import { useUsers } from "@/hooks/users/use-users";
import { getUserDisplayName } from "@/lib/get-user-display-name";
import { cn } from "@/lib/utils";

const ChatsPage = () => {
  const session = useAuthSession();
  const chats = useChats();
  const users = useUsers();
  const { chatId } = useParams<{ chatId: string }>();

  const usersById = useMemo(
    () => new Map(users.data?.map((user) => [user.user_id, user])),
    [users.data],
  );
  const loadedChats = chats.data?.pages.flatMap((page) => page.data) ?? [];
  const selectedChat = loadedChats.find((chat) => chat.id === chatId);
  const selectedUser = selectedChat ? usersById.get(selectedChat.relatedUser) : undefined;

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

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4" aria-busy={chats.isFetching}>
              <h2 className="px-3 pb-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">Recentes</h2>
              {chats.isPending && <ChatsListSkeleton />}
              {users.error && (
                <div className="mx-2 mb-3 space-y-2">
                  <RequestErrorAlert message={users.error.message} />
                  <Button variant="outline" size="sm" onClick={() => users.refetch()} disabled={users.isFetching}>Tentar carregar participantes</Button>
                </div>
              )}
              <ul className="space-y-0.5">
                {loadedChats.map((chat, index) => {
                  const user = usersById.get(chat.relatedUser);
                  return <ChatListItem key={`${chat.id}-${index}`} chat={chat} name={user ? getUserDisplayName(user.email) : "Participante"} email={user?.email} isActive={chat.id === chatId} />;
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
              {chats.hasNextPage && (
                <Button variant="ghost" className="mt-3 w-full text-primary" onClick={() => chats.fetchNextPage()} disabled={chats.isFetching}>
                  {chats.isFetchingNextPage ? "Carregando..." : "Carregar mais conversas"}
                </Button>
              )}
            </div>
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
                participantName={selectedUser ? getUserDisplayName(selectedUser.email) : undefined}
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
