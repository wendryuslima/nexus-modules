import {
  CircleAlert,
  CircleDot,
  MessageCircle,
  Star,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/app/components/layout/app-shell";
import { PeopleListSkeleton } from "@/app/components/people/people-list-skeleton";
import { PersonListItem } from "@/app/components/people/person-list-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { useUsers } from "@/hooks/users/use-users";
import { getUserDisplayName } from "@/lib/get-user-display-name";

const PeoplePage = () => {
  const session = useAuthSession();
  const users = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser = users.data?.find((user) => user.user_id === selectedUserId);
  const selectedUserName = selectedUser ? getUserDisplayName(selectedUser.email) : null;

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
              <span className="size-2.5 rounded-full bg-emerald-500" title="Conectado" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <div className="mb-2 flex items-center gap-2 px-2 text-sm font-semibold text-foreground">
                <Star aria-hidden="true" className="size-4 text-muted-foreground" />
                Mensagens diretas
              </div>

              {users.isPending && <PeopleListSkeleton />}

              {users.error && (
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

              {users.isSuccess && users.data.length > 0 && (
                <ul className="space-y-0.5">
                  {users.data.map((user) => (
                    <PersonListItem
                      key={user.user_id}
                      user={user}
                      isActive={user.user_id === selectedUserId}
                      onSelect={(selected) => setSelectedUserId(selected.user_id)}
                    />
                  ))}
                </ul>
              )}

              {users.isSuccess && users.data.length === 0 && (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  Ainda não há pessoas na sua equipe.
                </p>
              )}
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col bg-background">
            <header className="flex h-[4.5rem] shrink-0 items-center border-b px-5 sm:px-7">
              {selectedUserName ? (
                <div className="min-w-0">
                  <h2 className="truncate font-heading text-lg font-semibold">{selectedUserName}</h2>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CircleDot aria-hidden="true" className="size-3 text-emerald-500" />
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
                  <p className="mt-2 text-sm text-muted-foreground">
                    As mensagens desta conversa aparecerão aqui.
                  </p>
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
