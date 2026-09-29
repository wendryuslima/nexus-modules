import { MessageCircle } from "lucide-react";

const ChatPlaceholder = () => (
  <section className="flex min-w-0 flex-1 flex-col bg-background">
    <header className="flex h-[4.5rem] shrink-0 items-center border-b px-6">
      <h2 className="truncate text-lg font-semibold">Mensagens</h2>
    </header>
    <div className="flex flex-1 items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <MessageCircle aria-hidden="true" className="size-6" />
        </span>
        <h3 className="font-heading text-xl font-semibold">Suas conversas em um só lugar</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecione uma conversa na lista para abrir.
        </p>
      </div>
    </div>
  </section>
);

export { ChatPlaceholder };
