import { CircleAlert, Search, UsersRound } from "lucide-react";

import { AppShell } from "@/app/components/layout/app-shell";
import { PeopleListSkeleton } from "@/app/components/people/people-list-skeleton";
import { PersonListItem } from "@/app/components/people/person-list-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { useUsers } from "@/hooks/users/use-users";

const PeoplePage = () => {
  const session = useAuthSession();
  const users = useUsers();

  const peopleCountLabel = users.data
    ? `${users.data.length} ${users.data.length === 1 ? "pessoa" : "pessoas"}`
    : "Carregando pessoas";

  return (
    <AppShell currentUserEmail={session.data?.user?.email ?? null}>
      <SidebarInset className="h-dvh min-w-0 overflow-hidden">
        <header className="flex h-[4.5rem] shrink-0 items-center gap-3  bg-background px-4 sm:px-6 lg:px-8">
          <SidebarTrigger className="md:hidden" aria-label="Abrir menu" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              Pessoas
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Encontre quem faz parte da sua equipe.
            </p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <section className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Todos os usuários
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {peopleCountLabel}
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  placeholder="Buscar pessoas..."
                  aria-label="Buscar pessoas"
                  className="h-10 bg-secondary/60 pr-3 pl-9 shadow-none"
                />
              </div>
            </div>

            {users.isPending && <PeopleListSkeleton />}

            {users.error && (
              <Alert variant="destructive" className="items-start p-4">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>Não foi possível carregar as pessoas</AlertTitle>
                <AlertDescription className="mt-1">
                  <p>{users.error.message}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => users.refetch()}
                    disabled={users.isFetching}
                    className="mt-3"
                  >
                    {users.isFetching ? "Tentando novamente..." : "Tentar novamente"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {users.isSuccess && users.data.length > 0 && (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border bg-card shadow-sm">
                {users.data.map((user) => (
                  <PersonListItem key={user.user_id} user={user} />
                ))}
              </ul>
            )}

            {users.isSuccess && users.data.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
                <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                  <UsersRound aria-hidden="true" className="size-6" />
                </span>
                <h2 className="font-heading font-semibold text-foreground">
                  Ainda não há pessoas
                </h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Os usuários cadastrados aparecerão aqui.
                </p>
              </div>
            )}
          </section>
        </div>
      </SidebarInset>
    </AppShell>
  );
};

export default PeoplePage;
