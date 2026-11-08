import { X } from "lucide-react";
import { useEffect } from "react";
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
  const latestMatch = search.data?.pages[0]?.data.items.at(-1);

  useEffect(() => {
    if (!query || !latestMatch || search.isFetching || search.error || params.has("message")) return;
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set("message", String(latestMatch.sequence));
      return next;
    }, { replace: true });
  }, [query, latestMatch, search.isFetching, search.error, params, setParams]);

  return <aside aria-label="Pesquisa de mensagens" className="shrink-0 border-b bg-card px-4 py-3 sm:px-6">
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1"><SearchField name="messageQuery" label="Buscar palavras na conversa" autoFocus clearable={false} /></div>
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar pesquisa de mensagens"><X aria-hidden="true" /></Button>
    </div>
    {!query && <p className="mt-2 text-xs text-muted-foreground">Digite palavras completas e pressione Enter para pesquisar todo o histórico.</p>}
    {query && <div aria-busy={search.isFetching}>
      {search.isPending && <p role="status" className="py-2 text-sm text-muted-foreground">Pesquisando mensagens...</p>}
      {search.error && <div className="space-y-2"><RequestErrorAlert message={search.error.message} /><Button size="sm" variant="outline" disabled={search.isFetching} onClick={() => search.refetch()}>Tentar novamente</Button></div>}
      {!search.isPending && !search.error && !latestMatch && <p role="status" className="py-2 text-sm text-muted-foreground">Nenhuma mensagem encontrada para essas palavras.</p>}
    </div>}
  </aside>;
};

export { MessageSearch };
