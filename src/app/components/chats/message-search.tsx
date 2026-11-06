import { X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { SearchField } from "@/app/components/chats/search-field";
import { Button } from "@/components/ui/button";
import { useMessageSearch } from "@/hooks/chats/use-message-search";

type MessageSearchProps = { chatId: string; onClose: () => void };

const MessageSearch = ({ chatId, onClose }: MessageSearchProps) => {
  const [params, setParams] = useSearchParams();
  const query = (params.get("messageQuery") ?? "").trim();
  const search = useMessageSearch(chatId, query);
  const items = search.data?.pages.flatMap((page) => [...page.data.items].reverse()) ?? [];

  return <aside aria-label="Pesquisa de mensagens" className="shrink-0 border-b bg-card px-4 py-3 sm:px-6">
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1"><SearchField name="messageQuery" label="Buscar palavras na conversa" autoFocus clearable={false} /></div>
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar pesquisa de mensagens"><X aria-hidden="true" /></Button>
    </div>
    {!query && <p className="mt-2 text-xs text-muted-foreground">Digite palavras completas e pressione Enter para pesquisar todo o histórico.</p>}
    {query && <div className="mt-2 max-h-48 overflow-y-auto" aria-busy={search.isFetching}>
      {search.isPending && <p role="status" className="py-2 text-sm text-muted-foreground">Pesquisando mensagens...</p>}
      {search.error && <div className="space-y-2"><RequestErrorAlert message={search.error.message} /><Button size="sm" variant="outline" disabled={search.isFetching} onClick={() => search.isFetchNextPageError ? search.fetchNextPage() : search.refetch()}>Tentar novamente</Button></div>}
      {!search.isPending && !search.error && items.length === 0 && <p role="status" className="py-2 text-sm text-muted-foreground">Nenhuma mensagem encontrada para essas palavras.</p>}
      <ul className="space-y-1">
        {items.map((item) => <li key={item.id}><button type="button" className="w-full rounded-md px-3 py-2 text-left hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
          aria-current={params.get("message") === String(item.sequence) ? "true" : undefined}
          onClick={() => setParams((current) => { const next = new URLSearchParams(current); next.set("message", String(item.sequence)); return next; })}>
          <time dateTime={item.createdAt} className="block text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("pt-BR")}</time>
          <span className="line-clamp-2 break-words text-sm">{item.message.content.type === "TEXT" ? item.message.content.value : item.message.content.caption}</span>
        </button></li>)}
      </ul>
      {search.hasNextPage && !search.isFetchNextPageError && <Button size="sm" variant="ghost" disabled={search.isFetching} onClick={() => search.fetchNextPage()}>{search.isFetchingNextPage ? "Carregando..." : "Mais resultados"}</Button>}
    </div>}
  </aside>;
};

export { MessageSearch };
