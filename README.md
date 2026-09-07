# Frontend Development Guidelines

Siga estas regras em **todas as implementações e alterações no frontend**.

## 1. Componentes e shadcn/ui

- SEMPRE priorize componentes do **shadcn/ui** para elementos de interface, como:
  - Buttons
  - Inputs
  - Forms
  - Dialogs
  - Selects
  - Dropdowns
  - Tables
  - Cards
  - Tooltips
  - Popovers
  - Sheets
  - Tabs
  - Alerts
  - Outros componentes equivalentes disponíveis no shadcn/ui.

- NUNCA recrie manualmente um componente de UI que já exista no shadcn/ui.

- Caso o componente necessário exista no shadcn/ui, mas ainda não esteja instalado no projeto, **instale-o e utilize-o**.

- É permitido e esperado criar componentes próprios relacionados à aplicação, domínio, composição ou layout, como `LoginHeader`, `ProductCard`, `OrderSummary`, etc.

- SEMPRE verifique `@components/page.tsx` antes de construir uma página. Reutilize os componentes disponíveis nele sempre que forem adequados.

---

## 2. Componentização

Evite duplicação de código.

Quando uma mesma estrutura ou comportamento for utilizado em mais de um lugar, extraia para um componente reutilizável.

Prefira:

```tsx
<ProductCard product={product} />
```

em vez de repetir o mesmo JSX em diferentes páginas.

Componentes devem possuir **responsabilidade única**.

Evite arquivos grandes contendo múltiplos componentes ou responsabilidades diferentes.

Prefira:

```tsx
const LoginHeader = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src="/nexuslogo-png.jpg"
        alt="Nexus"
        className="h-11 w-auto rounded-xl"
      />

      <h2>Bem-vindo de volta</h2>
      <h1>Entre na sua conta para continuar.</h1>
    </div>
  );
};

export default LoginHeader;
```

Cada componente relevante deve ficar em seu próprio arquivo quando possuir uma responsabilidade independente.

Use nomes **simples, claros e previsíveis** para:

- arquivos;
- componentes;
- funções;
- hooks;
- services;
- tipos;
- variáveis.

Evite abstrações prematuras. Extraia componentes quando houver reutilização, responsabilidade independente ou quando isso melhorar claramente a legibilidade.

---

## 3. Estrutura de pastas

SEMPRE respeite a estrutura existente do projeto.

Cada arquivo deve ficar na pasta correspondente à sua responsabilidade.

Exemplo conceitual:

```text
src/
├── app/
│   ├── components/
│   └── pages/
├── components/
│   └── ui/
├── hooks/
├── services/
├── types/
└── ...
```

### Responsabilidades

- `app/pages`: páginas da aplicação.
- `app/components`: componentes específicos da aplicação/domínio.
- `components/ui`: componentes do shadcn/ui.
- `services`: comunicação com APIs e serviços externos.
- `hooks`: hooks da aplicação, incluindo hooks do React Query.
- `types`: tipos e interfaces compartilhados.

NUNCA coloque um arquivo em uma pasta que represente outra responsabilidade.

Antes de criar uma nova pasta ou estrutura, verifique e siga o padrão já existente no projeto.

---

## 4. Tipagem

SEMPRE mantenha as entidades da aplicação tipadas.

Evite `any`.

Crie tipos explícitos para:

- entidades;
- payloads;
- responses;
- props;
- parâmetros;
- retornos relevantes.

Exemplo:

```tsx
type Product = {
  id: string;
  name: string;
  price: number;
};

type CreateProductPayload = {
  name: string;
  price: number;
};
```

Reutilize tipos existentes sempre que possível em vez de declarar estruturas equivalentes novamente.

---

## 5. Services

Chamadas HTTP devem ficar nos `services`.

O service é responsável pela comunicação com a API.

Exemplo:

```tsx
const createProduct = async (
  payload: CreateProductPayload,
): Promise<Product> => {
  // API request
};
```

Componentes e páginas NÃO devem realizar chamadas HTTP diretamente.

---

## 6. React Query

Utilize **TanStack React Query** para gerenciamento de server state.

A separação deve seguir:

```text
Component/Page
      ↓
React Query Hook
      ↓
Service
      ↓
API
```

Ou seja:

- `service`: realiza a chamada HTTP;
- `hook`: controla query/mutation, cache, invalidação e estados do React Query;
- `component/page`: consome o hook e renderiza o estado.

Exemplo:

```tsx
const useProductsCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),

    onSuccess: (createdProduct) => {
      const createdProductId = createdProduct.id?.trim();

      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.many(),
      });

      if (createdProductId) {
        queryClient.invalidateQueries({
          queryKey: productsQueryKeys.byId(createdProductId),
        });
      }
    },
  });
};

export { useProductsCreate };
```

Não execute requests diretamente dentro dos componentes quando elas puderem seguir esse fluxo.

Mantenha `queryKeys` centralizadas e reutilizáveis seguindo o padrão já existente no projeto.

---

## 7. Tratamento de erros

Erros de negócio e mensagens relacionadas às requisições devem vir **diretamente do servidor**.

O frontend deve apenas:

1. receber o erro;
2. extrair a mensagem retornada pela API;
3. renderizar essa mensagem para o usuário.

NUNCA substitua um erro retornado pela API por uma mensagem de negócio inventada localmente no frontend.

NUNCA duplique regras de negócio do backend apenas para produzir mensagens de erro no frontend.

Validações puramente de interface ou estrutura do formulário podem existir quando necessárias, mas erros de negócio provenientes de operações da API devem utilizar a mensagem fornecida pelo servidor.

---

# Estilização

## 8. Cores

NUNCA utilize cores hard-coded do Tailwind.

### Proibido

```tsx
text-white
text-white/70
text-black
bg-white
bg-black
bg-[#2b54ff]
border-[#f1f1f1]
bg-[oklch(...)]
text-[#...]
```

### Correto

Utilize os tokens semânticos definidos pelo tema em `@app/globals.css`.

Exemplos:

```tsx
text - foreground;
text - muted - foreground;
text - background;
text - background / 70;

bg - background;
bg - foreground;
bg - primary;
bg - secondary;
bg - muted;
bg - accent;

text - primary - foreground;
text - secondary - foreground;

border - border;
ring - ring;
```

As cores da aplicação devem ser controladas pelo tema, e não diretamente pelos componentes.

---

## 9. Novas cores

Antes de criar qualquer nova variável CSS de cor:

1. Verifique os tokens existentes em `@app/globals.css`.
2. Verifique se algum token semântico existente do shadcn/ui atende à necessidade.
3. Consulte a documentação oficial de theming do shadcn/ui.
4. SOMENTE se nenhum token existente representar corretamente a intenção semântica, crie uma nova variável em `@app/globals.css`.
5. Siga exatamente o padrão de nomenclatura e estrutura já utilizado pelo tema.

NUNCA adicione uma cor hard-coded em um componente como atalho para evitar configurar corretamente o tema.

---

# Checklist obrigatório

Antes de finalizar qualquer implementação, verifique:

- O shadcn/ui já possui o componente necessário?
- Consultei `@components/ui/page.tsx`?
- Estou recriando algo que já existe?
- Existe código/JSX duplicado que deveria virar componente?
- Cada componente possui uma responsabilidade clara?
- Os arquivos estão nas pastas corretas?
- As entidades, payloads e responses estão tipados?
- Evitei `any`?
- As chamadas HTTP estão nos `services`?
- Server state está sendo gerenciado pelo React Query?
- As invalidações de cache estão corretas?
- Estou exibindo os erros retornados pelo servidor?
- Existe alguma cor hard-coded?
- Estou utilizando os tokens semânticos do tema?
- Criei alguma variável CSS desnecessária?
- A implementação segue os padrões já existentes no projeto?

**Não considere a tarefa concluída enquanto houver violação dessas regras.**
