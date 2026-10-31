# Imagens nas conversas

O composer aceita uma imagem JPEG ou PNG por mensagem, até 10 MiB, com legenda
opcional. A validação de formato, tamanho e dimensões pertence ao backend;
mensagens de erro da API são exibidas diretamente.

Fluxo: `MessageComposer → useSendTimelineMessage → uploadImage → createMessage`.
O upload envia `FormData` com `chatId`, `clientUploadId` e `file` para
`POST /v1/images`. A resposta contém `id`, `contentType`, `sizeBytes`, `width` e
`height`. O envio posterior usa a rota de mensagens existente, com conteúdo
`{ type: "IMAGE", imageId, caption? }` e o `clientMessageId` da intenção.

Em falhas, a seleção e os identificadores são mantidos para repetir as operações
sem criar outro arquivo ou mensagem. Alterar o conteúdo cria uma nova intenção.
Uploads expirados ou imagens indisponíveis exigem uma nova intenção de upload.
A prévia usa uma object URL local, liberada ao trocar/remover o arquivo ou sair
da conversa.

`TimelineImage → useImageAccess → getImageAccess` consulta
`GET /v1/images/{imageId}/access`. A URL assinada dura dez minutos e é renovada
antes da expiração enquanto a aba está ativa. O navegador carrega a imagem
diretamente do Garage. Falhas têm ação para tentar novamente. A URL permanece
somente em memória, sem armazenamento local ou em payloads de mensagem.

Timeline e realtime usam a mesma união discriminada `MessageContentDto`:
`TEXT` contém `value`; `IMAGE` contém `imageId` e uma legenda opcional de até
4.000 caracteres Unicode. O parser de realtime valida ambas as variantes.
Deduplicação e recuperação por sequência são compartilhadas com mensagens de texto.

A configuração do storage, estados, limpeza, limites e contratos completos estão
em `nexus-services/docs/images.md`.
