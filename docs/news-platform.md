# Plataforma de Notícias

## Objetivo

Construir uma aplicação web para agregar e exibir notícias e conteúdos de
tecnologia, desenvolvimento e produtos digitais.

A aplicação consumirá fontes externas, normalizará os dados e exibirá os
resultados em uma interface responsiva, com foco em qualidade de software,
testes automatizados e integração contínua.

## Escopo do MVP

### Incluído

- Página pública de notícias.
- Integração com fontes externas.
- Normalização dos conteúdos recebidos.
- Filtro por fonte.
- Ordenação por data ou relevância.
- Cards responsivos.
- Página de detalhes.
- Estados de loading, erro e lista vazia.
- Testes unitários, de integração e E2E.
- Execução local com Docker Compose.
- CI no GitHub Actions.

### Fora do escopo inicial

- Blog próprio.
- Cursos.
- Comentários e curtidas.
- Busca avançada.
- Painel administrativo completo.
- Recuperação de senha.
- Upload de imagens.
- Sistema de recomendação.

## Autenticação

O backend já possui:

- `POST /auth/register`;
- `POST /auth/login`;
- middleware JWT;
- `GET /auth/me`;
- rota protegida;
- senhas armazenadas com bcrypt;
- CORS configurado.

Cadastro e recuperação de senha não bloqueiam o desenvolvimento da página
pública. A recuperação de senha será implementada posteriormente, pois exige
serviço de email, tokens temporários, expiração e invalidação após uso.

## Fontes externas

### Hacker News

API oficial:

```text
https://hacker-news.firebaseio.com/v0/
```

Endpoints iniciais:

```text
/v0/topstories.json
/v0/newstories.json
/v0/beststories.json
/v0/item/:id.json
```

Referência: https://github.com/HackerNews/API

### DEV.to

```text
https://dev.to/api/articles
```

A API oferece artigos publicados e paginação. Alguns endpoints podem exigir
headers ou API key.

Referência: https://developers.forem.com/api/

### Reddit

Listagens possíveis:

```text
/r/programming/hot
/r/programming/new
/r/programming/top
```

A integração deve respeitar autenticação, paginação, rate limits e as regras
de acesso do Reddit.

Referência: https://www.reddit.com/dev/api/

### GitHub

A REST API pode fornecer repositórios, issues, pull requests, eventos e
releases.

Referência: https://docs.github.com/en/rest/using-the-rest-api

### Product Hunt

A API utiliza GraphQL:

```text
https://api.producthunt.com/v2/api/graphql
```

Ela exige access token e possui limites de uso específicos.

Referência: https://api.producthunt.com/v2/docs

## Modelo normalizado

Todas as fontes devem ser convertidas para o mesmo formato interno:

```ts
type NewsItem = {
  id: string
  source: 'hackernews' | 'devto' | 'reddit' | 'github' | 'producthunt'
  externalId: string
  title: string
  url: string
  summary: string | null
  author: string | null
  imageUrl: string | null
  publishedAt: string | null
  score: number | null
  createdAt: string
  updatedAt: string
}
```

A interface não deve conhecer o formato específico de cada fonte.

## Arquitetura do backend

Stack:

- Node.js;
- TypeScript;
- Express;
- PostgreSQL;
- Zod;
- bcrypt;
- JWT;
- Vitest;
- Playwright.

Fluxo principal:

```text
Route
  ↓
Controller
  ↓
Use Case
  ↓
Service
  ↓
Provider externo ou Repository
  ↓
PostgreSQL/API externa
```

Estrutura sugerida:

```text
backend/src/
├── config/
├── controllers/
├── domain/
├── exceptions/
├── middlewares/
├── providers/
├── repositories/
├── routes/
├── schemas/
├── services/
├── usecases/
├── db.ts
└── index.ts
```

### Responsabilidades

- **Controller:** lê a requisição, chama o use case e monta a resposta HTTP.
- **Use case:** representa uma ação do sistema, como `GetNews` ou `SyncNews`.
- **Service:** orquestra fontes, normaliza dados e aplica regras de negócio.
- **Provider:** conversa com uma fonte externa específica.
- **Repository:** persiste e consulta dados no PostgreSQL.

## Banco de dados

```sql
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(30) NOT NULL,
  external_id VARCHAR(150) NOT NULL,
  title VARCHAR(300) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  summary TEXT,
  author VARCHAR(150),
  image_url VARCHAR(1000),
  published_at TIMESTAMPTZ,
  score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, external_id)
);
```

A combinação `source + external_id` evita duplicações durante sincronizações.

## API da aplicação

### Listar notícias

```http
GET /news
```

Parâmetros previstos:

```text
source
limit
offset
sort
```

### Buscar notícia por ID

```http
GET /news/:id
```

Respostas esperadas:

- `200`: notícia encontrada;
- `404`: notícia inexistente.

### Sincronizar notícias

Futuramente:

```http
POST /admin/news/sync
Authorization: Bearer <token>
```

Essa rota deverá ser protegida e usada somente por usuários autorizados.

## Estratégia QA-first

Cada funcionalidade deve seguir um ciclo próximo de TDD:

```text
1. Definir o comportamento esperado
2. Escrever o teste que falha
3. Implementar o mínimo necessário
4. Fazer o teste passar
5. Refatorar
6. Rodar toda a suíte
```

## Testes do backend

### Unitários

Cobrir regras puras de normalização, ordenação, deduplicação, validação e
paginação. Esses testes não devem acessar rede nem PostgreSQL.

### Providers

Usar fixtures para testar respostas válidas, vazias, incompletas, `429`, `500`
e timeout.

### Integração

Cobrir:

- `GET /news` com sucesso;
- filtro por fonte;
- paginação;
- lista vazia;
- notícia inexistente;
- persistência no PostgreSQL;
- não duplicação por `source + external_id`.

## Frontend

Stack:

- React;
- TypeScript;
- Vite;
- Tailwind CSS;
- shadcn/ui;
- React Testing Library;
- Playwright.

A interface será construída com abordagem mobile-first.

Estrutura sugerida:

```text
frontend/src/
├── components/
│   ├── news-card.tsx
│   ├── news-grid.tsx
│   ├── loading-card.tsx
│   ├── empty-state.tsx
│   └── error-message.tsx
├── pages/
│   ├── NewsPage.tsx
│   └── NewsDetailsPage.tsx
├── services/
│   ├── api.ts
│   └── newsApi.ts
├── types/
│   └── news.ts
└── App.tsx
```

### Página de notícias

Deve conter cabeçalho, título, filtros por fonte, grid responsivo, cards,
loading, erro, estado vazio e paginação ou carregamento incremental.

Layout inicial:

```text
mobile: 1 coluna
tablet: 2 colunas
desktop: 3 ou 4 colunas
```

## Testes do frontend

### Componentes

Cobrir renderização de cards, loading, erro, lista vazia, filtros e retry.

### Acessibilidade

Validar labels, roles, foco visível, contraste e uso correto de `button`, `a`
e headings.

### E2E

Fluxo principal:

```text
1. Abrir página de notícias
2. Aguardar carregamento
3. Verificar cards
4. Filtrar por fonte
5. Abrir uma notícia
6. Verificar a página de detalhes
7. Voltar para a listagem
```

O E2E deve cobrir os fluxos críticos. Estados simples devem ser cobertos por
testes de componente.

## Docker

Serviços planejados:

```text
postgres
backend
frontend
```

Inicialmente, PostgreSQL e backend rodam via Docker Compose, enquanto o
frontend pode rodar localmente com Vite.

```bash
docker compose up -d --build
pnpm --dir frontend dev
```

Segredos devem ser configurados por variáveis de ambiente:

```env
DATABASE_URL=
JWT_SECRET=
GITHUB_TOKEN=
DEVTO_API_KEY=
PRODUCT_HUNT_TOKEN=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
```

Nenhuma credencial deve ser commitada.

## GitHub Actions

O CI deve executar:

```text
1. Instalar dependências
2. Subir PostgreSQL
3. Executar schema/migrations
4. Testar backend
5. Testar frontend
6. Fazer build do backend
7. Fazer build do frontend
8. Executar E2E
```

Jobs sugeridos:

```text
backend: typecheck, unitários e integração
frontend: typecheck, componentes e build
e2e: backend + PostgreSQL + frontend + Playwright
```

## Definition of Done

- [ ] Regra de negócio implementada.
- [ ] Validação implementada.
- [ ] Teste unitário criado.
- [ ] Teste de integração criado.
- [ ] Teste de componente criado quando houver UI.
- [ ] Teste E2E criado para fluxo crítico.
- [ ] Build passando.
- [ ] CI passando.
- [ ] Nenhuma credencial hardcoded.
- [ ] Loading, erro e estado vazio tratados.
- [ ] Acessibilidade básica validada.
- [ ] Documentação atualizada.

## Roadmap

### Fase 1 — contrato e base

- [ ] Criar tipos de `NewsItem`.
- [ ] Criar schema Zod.
- [ ] Criar fixtures das fontes.
- [ ] Definir resposta de `GET /news`.
- [ ] Criar teste inicial do endpoint.

### Fase 2 — primeira fonte

- [ ] Implementar Hacker News provider.
- [ ] Criar testes unitários do provider.
- [ ] Criar repository PostgreSQL.
- [ ] Criar use case de sincronização.
- [ ] Criar teste de integração.

### Fase 3 — mais fontes

- [ ] Adicionar DEV.to.
- [ ] Adicionar GitHub.
- [ ] Adicionar Reddit.
- [ ] Adicionar Product Hunt.
- [ ] Tratar rate limits e falhas parciais.

### Fase 4 — frontend

- [ ] Criar `NewsPage`.
- [ ] Criar `NewsCard`.
- [ ] Criar loading, erro e estado vazio.
- [ ] Criar filtro por fonte.
- [ ] Criar página de detalhes.
- [ ] Criar testes de componentes.

### Fase 5 — E2E e CI

- [ ] Criar E2E da listagem.
- [ ] Criar E2E do filtro.
- [ ] Criar E2E dos detalhes.
- [ ] Adicionar build do frontend ao CI.
- [ ] Adicionar job E2E ao CI.
- [ ] Publicar relatórios de testes.

## Próximo passo imediato

Começar com uma única fonte:

```text
Hacker News
  ↓
provider
  ↓
normalização
  ↓
repository
  ↓
GET /news
  ↓
teste de integração
  ↓
NewsPage
  ↓
teste E2E
```

Depois que esse fluxo estiver sólido, adicionar as demais fontes uma por uma.
