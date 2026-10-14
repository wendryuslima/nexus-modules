import {
  CircleAlert,
  CircleDot,
  MessageCircle,
  Star,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { AppShell } from "@/app/components/layout/app-shell";
import { PeopleListSkeleton } from "@/app/components/people/people-list-skeleton";
import { PersonListItem } from "@/app/components/people/person-list-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { useCreateDirectChat } from "@/hooks/chats/use-create-direct-chat";
import { useUsers } from "@/hooks/users/use-users";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getUserDisplayName } from "@/lib/get-user-display-name";

const PeoplePage = () => {
  const session = useAuthSession();
  const users = useUsers();
  const createDirectChat = useCreateDirectChat();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const loadedUsers = users.data?.pages.flatMap((page) => page.data) ?? [];
  const { scrollAreaRef, sentinelRef } = useInfiniteScroll({
    hasNextPage: Boolean(users.hasNextPage),
    isFetchingNextPage: users.isFetchingNextPage,
    isFetchNextPageError: users.isFetchNextPageError,
    itemCount: loadedUsers.length,
    fetchNextPage: users.fetchNextPage,
  });

  const selectedUser = loadedUsers.find((user) => user.user_id === selectedUserId);
  const selectedUserName = selectedUser ? getUserDisplayName(selectedUser.email) : null;

  const openDirectChat = (relatedUserId: string) => {
    setSelectedUserId(relatedUserId);
    createDirectChat.mutate(
      { relatedUserId },
      {
        onSuccess: ({ data }) => navigate(`/chats/${encodeURIComponent(data.id)}`),
      },
    );
  };

  return (
    <AppShell currentUserEmail={session.data?.user?.email ?? null}>
      <SidebarInset className="h-dvh min-w-0 overflow-hidden">
        <div className="flex min-h-0 flex-1">
          <aside className="flex w-72 shrink-0 flex-col border-r bg-card sm:w-80">
            <div className="flex h-[4.5rem] items-center gap-2 border-b px-3 sm:px-4">
              <SidebarTrigger className="md:hidden" aria-label="Abrir menu principal" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-heading text-lg font-semibold">Nexus</h1>
                <p className="truncate text-xs text-muted-foreground">Sua equipe</p>
              </div>
              <span className="size-2.5 rounded-full bg-primary" title="Conectado" />
            </div>

            <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1" aria-busy={users.isFetching}>
              <div className="px-3 py-3">
              <div className="mb-2 flex items-center gap-2 px-2 text-sm font-semibold text-foreground">
                <Star aria-hidden="true" className="size-4 text-muted-foreground" />
                Mensagens diretas
              </div>

              {users.isPending && <PeopleListSkeleton />}

              {users.error && !users.data && (
                <Alert variant="destructive" className="p-3">
                  <CircleAlert aria-hidden="true" className="size-4" />
                  <AlertTitle className="text-sm">Não foi possível carregar</AlertTitle>
                  <AlertDescription className="mt-2">
                    <Button
                      
                      variant="outline"
                      size="sm"
                      onClick={() => users.refetch()}
                      disabled={users.isFetching}
                    >
                      Tentar novamente
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {loadedUsers.length > 0 && (
                <ul className="space-y-0.5">
                  {loadedUsers.map((user) => (
                    <PersonListItem
                      key={user.user_id}
                      user={user}
                      isActive={user.user_id === selectedUserId}
                      disabled={createDirectChat.isPending}
                      onSelect={(selected) => openDirectChat(selected.user_id)}
                    />
                  ))}
                </ul>
              )}

              {users.isSuccess && loadedUsers.length === 0 && (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  Ainda não há pessoas na sua equipe.
                </p>
              )}
              {users.isFetchNextPageError && users.error && (
                <div className="mt-3 space-y-2">
                  <RequestErrorAlert message={users.error.message} />
                  <Button variant="outline" size="sm" onClick={() => users.fetchNextPage()} disabled={users.isFetching}>
                    Tentar novamente
                  </Button>
                </div>
              )}
              {users.isFetchingNextPage && <p role="status" className="px-2 py-3 text-xs text-muted-foreground">Carregando pessoas...</p>}
              <div ref={sentinelRef} aria-hidden="true" className="h-px" />
              </div>
            </ScrollArea>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col bg-background">
            <header className="flex h-[4.5rem] shrink-0 items-center border-b px-5 sm:px-7">
              {selectedUserName ? (
                <div className="min-w-0">
                  <h2 className="truncate font-heading text-lg font-semibold">{selectedUserName}</h2>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CircleDot aria-hidden="true" className="size-3 text-primary" />
                    Disponível para conversar
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="font-heading text-lg font-semibold">Mensagens</h2>
                  <p className="text-xs text-muted-foreground">Escolha uma pessoa para começar</p>
                </div>
              )}
            </header>

            <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center">
              {selectedUserName ? (
                <div className="max-w-sm">
                  <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                    <MessageCircle aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="font-heading text-xl font-semibold">Conversa com {selectedUserName}</h3>
                  {createDirectChat.error ? (
                    <div className="mt-4 text-left">
                      <RequestErrorAlert message={createDirectChat.error.message} />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {createDirectChat.isPending
                        ? "Abrindo conversa..."
                        : "Selecione novamente para tentar abrir a conversa."}
                    </p>
                  )}
                </div>
              ) : (
                <div className="max-w-sm">
                  <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                    <UsersRound aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="font-heading text-xl font-semibold">Sua caixa de mensagens</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selecione uma pessoa na barra lateral para abrir uma conversa.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </SidebarInset>
    </AppShell>
  );
};

export default PeoplePage;
