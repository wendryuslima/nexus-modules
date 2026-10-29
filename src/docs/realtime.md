# Mensagens em tempo real

O provider fica na rota autenticada e mantém automaticamente uma conexão por aba. Alternar conversas não cria outro socket. O WebSocket faz parte do funcionamento normal da aplicação, sem flag de ativação no ambiente ou no build.

- `services/auth/get-session.ts`: consulta identidade e validade do acesso.
- `services/auth/session-lock.ts`: serializa mudanças de credenciais entre abas.
- `services/auth/session-lifecycle.ts`: protege callbacks de sessões anteriores e descarta dados privados.
- `services/realtime/protocol.ts`: valida frames.
- `services/realtime/controller.ts`: conexão, eventos, reconexão e recuperação HTTP.
- `services/realtime/logger.ts`: logs no console com prefixo `[WS]`, sem conteúdo de mensagens ou credenciais.
- `hooks/chats/use-send-timeline-message.ts`: persiste por POST, sem invalidar chats ou timeline após o envio.
- `lib/realtime-view-data.ts`: aplica eventos ao estado da tela, deduplica mensagens e preserva eventos diante de respostas HTTP antigas.
- `lib/merge-timeline-pages.ts`: ordena páginas HTTP e mensagens recebidas pelo socket.
- `lib/invalidate-backend-query.ts`: releitura HTTP para recuperação.
- `lib/query-client.ts`: descarta queries sem observadores e busca novamente ao abrir uma tela.
- `services/http/api-client.ts`: usa `cache: "no-store"`.

## Caminho normal de uma mensagem

1. O remetente envia `POST /v1/chats/{chatId}/messages`.
2. A API persiste a mensagem e a outbox.
3. O dispatcher entrega `message.created` aos dois participantes.
4. O frontend adiciona a mensagem à timeline aberta e atualiza a posição/data da conversa conhecida.
5. Mensagens repetidas usam o mesmo ID e aparecem uma única vez.

O POST e o evento não disparam GETs de chats ou timeline nesse fluxo. A mensagem exibida vem do payload validado do WebSocket, e `isMine` é derivado da sessão autenticada. O estado permanece `connected`; não aparece “Sincronizando mensagens” a cada envio.

O TanStack Query mantém os dados usados pela tela montada, incluindo mensagens recebidas pelo socket. Isso é estado em memória, sem persistência local de mensagens. `gcTime: 0` descarta queries sem observadores, `staleTime: 0` mantém sua política de atualização e `refetchOnMount: "always"` busca dados ao reabrir a tela. O cache HTTP continua desabilitado.

## Quando existe HTTP adicional

A carga inicial e o histórico usam HTTP. Após `connection.ready` ou reconexão, as queries são reconsultadas para recuperar o período sem assinatura. Lacunas de sequência também disparam recuperação. Foco/conectividade e a verificação periódica de 60 segundos recuperam notificações perdidas silenciosamente, em segundo plano.

Se o evento mencionar uma conversa ausente da lista carregada, uma consulta agrupada descobre seus metadados e participante. Eventos de conversas já conhecidas atualizam a lista diretamente.

A recuperação refaz as páginas carregadas com os novos cursores do servidor. Mensagens recebidas durante uma consulta ficam na projeção da tela até uma fotografia HTTP que já as inclua. Durante a primeira carga, um buffer transitório limitado a 100 eventos ou 1 MiB preserva eventos; ao exceder, o cliente reconecta e recupera pelo backend. Esse buffer é descartado no encerramento da conexão.

O controlador concentra os gatilhos de foco e conectividade; as queries de chats/timeline não executam uma segunda atualização automática nesses mesmos gatilhos. “Sincronizando mensagens” é reservado para recuperação inicial, reconexão ou lacunas, não para mensagens normais nem verificações de fundo.

## Diagnóstico

No DevTools, filtre o console por `[WS]`. A sequência esperada é abertura do socket, `connection.ready recebido` e `message.created recebido; atualizando tela pelo WebSocket`.

Erros, timeout de prontidão, código de fechamento, reconexão e recuperação HTTP também são registrados. Em `Network > WS`, `101` confirma o upgrade; `401` indica sessão inválida, `403` indica origem rejeitada e `503` indica gateway/NATS indisponível. Os frames ficam na conexão WS, não na lista Fetch/XHR.

Web Locks é requisito dos navegadores suportados. Logout suspende imediatamente callbacks; sessões anteriores não atualizam a tela atual. O envio usa a mesma chave idempotente em retries, e `PERSISTED` confirma somente persistência.

Verificação local: `bun test`, `npm run build` e ESLint nos arquivos alterados. Os testes cobrem eventos sem GET, ausência de sincronização por mensagem, duplicatas, ordenação, respostas antigas, eventos durante HTTP, lacunas e logout.
