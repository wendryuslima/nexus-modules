# Lista paginada de usuários

`GET /v1/users?page=1&pageSize=30` exige cookie de sessão (`credentials: "include"`). A resposta contém `data` e `pagination`:

```ts
type UserCursor = { id: string; createdAt: string };
type ListUsersResponse = {
  data: { user_id: string; email: string; created_at: string }[];
  pagination: {
    hasNext: boolean;
    nextCursor: UserCursor | null;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};
```

O padrão é `page=1&pageSize=30`; `pageSize` aceita de 1 a 100. A ordem é `created_at` crescente e `user_id` crescente em caso de empate. Quando `hasNext` for `true`, faça a próxima chamada com `page` incrementado e `cursorId`/`cursorCreatedAt` copiados de `nextCursor`, preservando a precisão de `createdAt`:

```text
GET /v1/users?page=2&pageSize=30&cursorId=<id>&cursorCreatedAt=<data-url-encoded>
```

Um cursor só pode ser usado da página 2 em diante. Ao fim da lista, `hasNext=false` e `nextCursor=null`. `data` pode ser vazio. Parâmetros inválidos recebem `400 invalid_pagination`. A tela usa `useInfiniteQuery` e carrega a próxima página automaticamente ao chegar ao fim do ScrollArea; uma falha em página adicional oferece ação de nova tentativa.

A listagem de conversas recebe `relatedUserEmail` na própria página de chats e não depende de carregar todos os usuários.
