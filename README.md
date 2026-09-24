# Software Quality Lab

Projeto pessoal de **Software Quality Engineering** para publicar conteúdo técnico, registrar case studies e manter aplicações reais para estudo de qualidade de software. O nome e os links profissionais ainda são configuráveis; informações profissionais que não foram fornecidas ficam explicitamente marcadas como placeholders.

## O que foi encontrado e decidido

O repositório original era um monorepo simples com React/Vite no frontend e Express/TypeScript/PostgreSQL no backend. Tinha autenticação genérica com JWT, uma tabela `users`, um agregador de notícias com provider Hacker News, Docker Compose, validação Zod, bcrypt, testes Vitest e testes de API Playwright.

Mantive a base saudável: React, TypeScript, Vite, Express, PostgreSQL, Docker, Zod, bcrypt, Vitest, Playwright, TypeScript strict e as abstrações pequenas de erro/validação. Removi o domínio de notícias por completo: páginas, componentes, provider, rotas, serviços, repositórios, modelos, testes, documentação e tabelas incompatíveis. Não havia frontend de produção reutilizável além da estrutura React/Vite.

## Arquitetura atual

```text
frontend/                 React + Vite + TypeScript
  src/components/         Layout, cards, Markdown preview
  src/pages/              site público, Test Lab e Admin
  src/lib/                API client e i18n
backend/
  src/routes/             content, admin auth/content, lab auth/lab
  src/repositories/       persistência de conteúdo
  src/middlewares/        autenticação separada por contexto e validação
  src/security/           Markdown sanitizado e rate limit
  src/services/           bootstrap de usuários de demonstração
  db/migrations/          schema do Software Quality Lab
tests/api/                Playwright contra API e PostgreSQL real
tests/e2e/                Playwright contra frontend real
```

O backend não serve JSON estático: autenticação, autorização, conteúdo, persistência, regras de lockout e sessões do Lab são implementados na API e no banco.

## Funcionalidades V1

- Home profissional, About, Articles, Case Studies, Test Lab e Authentication Lab.
- PT-BR como idioma padrão e seletor PT-BR/EN.
- Tema claro/escuro com preferência do sistema, alternância acessível no header e persistência local.
- Conteúdo `ARTICLE` e `CASE_STUDY`, categorias pequenas e tags livres.
- Traduções PT-BR obrigatórias e EN opcional; detalhe em inglês faz fallback para PT-BR com aviso discreto.
- Markdown com blocos de código; renderização no backend sanitizada com `sanitize-html` e preview do editor sanitizado no browser.
- Admin separado com login, bcrypt, JWT próprio, criação/edição, rascunho, publicação, destaque, tradução e exclusão.
- Authentication Lab separado do Admin: credenciais próprias, sessões persistidas como hash, logout/revogação, expiração, endpoint protegido, lockout após cinco falhas e mensagens que não permitem enumeração de usuário.
- Links configuráveis de GitHub, LinkedIn, email e currículo. Os valores iniciais são placeholders.
- Sem analytics, tracking, cadastro público, comentários, pagamentos, newsletter ou funcionalidades futuras não necessárias à V1.

## Executar localmente

Pré-requisitos: Node.js 22+, pnpm 10+ e Docker.

```bash
cp .env.example .env
pnpm install
pnpm --dir backend install
pnpm --dir frontend install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

Frontend: `http://localhost:5173`

API: `http://localhost:3000`
Health check: `http://localhost:3000/health`

Para entrar no Admin local, use os valores de `ADMIN_EMAIL` e `ADMIN_PASSWORD` do `.env` (por padrão `admin@softwarequalitylab.local` / `ChangeMe123!`). Para o Lab, use `LAB_DEMO_EMAIL` e `LAB_DEMO_PASSWORD` (por padrão `demo@lab.local` / `LabPass123!`). Troque todos os segredos fora de um ambiente local.

O backend executa `pnpm db:migrate` antes de iniciar. As migrations ficam em `backend/db/migrations/` e as versões aplicadas são registradas em `schema_migrations`. O `backend/db/init.sql` existe para o primeiro boot do PostgreSQL no Docker, mas o runner é o caminho usado no desenvolvimento, CI e produção. Se já existia um volume da aplicação antiga, a migration remove explicitamente `users` e `news_items`, pois esses dados pertencem ao produto descartado. Para recriar o banco desde zero, remova somente o volume nomeado do projeto quando isso for aceitável.

## Variáveis de ambiente

Veja [.env.example](.env.example). As principais são:

- `DATABASE_URL`, `TEST_DATABASE_URL`, `PORT`, `FRONTEND_ORIGIN`;
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`;
- `LAB_DEMO_EMAIL`, `LAB_DEMO_PASSWORD`.

Segredos não são importados pelo frontend. O frontend conhece apenas `VITE_API_URL`.

Em produção, execute as migrations antes de iniciar a API:

```bash
DATABASE_URL="postgres://..." pnpm --dir backend db:migrate
```

O comando aplica somente arquivos ainda ausentes em `schema_migrations`, dentro de transação e com lock para evitar execuções concorrentes.

## Conteúdo e Admin

Rotas públicas:

- `GET /content?type=ARTICLE|CASE_STUDY&locale=pt-BR|en`
- `GET /content/:slug?locale=pt-BR|en`

Rotas administrativas protegidas por `Authorization: Bearer <admin-token>`:

- `POST /admin/auth/login`, `GET /admin/auth/me`, `POST /admin/auth/logout`;
- `GET/POST /admin/content`, `GET/PUT/DELETE /admin/content/:id`.

O conteúdo editorial é persistido em `content_entries` e `content_translations`. Os Labs não são editáveis pelo CMS: regras dos Labs continuam no código, com testes, commit, CI e deploy.

## Authentication Lab

Rotas do sandbox:

- `POST /lab/auth/login`, `GET /lab/auth/me`, `POST /lab/auth/logout`;
- `GET /lab/protected-resource`.

Admin e Lab usam tabelas, tokens e fluxos separados. O Lab V1 cobre happy path, credenciais inválidas, prevenção básica de enumeração, sessões persistidas, expiração, logout/revogação, requests autenticadas, lockout e rate limit. Mudança de senha, múltiplas sessões e cenários de autorização mais complexos ficam para evolução.

## Testes

```bash
pnpm test                     # testes unitários backend + frontend
pnpm test:frontend             # testes de comportamento do frontend
pnpm lint                      # typecheck frontend + backend
pnpm build                     # build frontend + backend
pnpm test:api                 # Playwright API; Postgres de teste separado
pnpm test:e2e                 # Playwright no frontend + backend de teste
```

Os testes de API resetam somente o estado mutável de conteúdo/sessão e mantêm os usuários de demonstração criados no bootstrap. A suíte cobre Admin protegido, login inválido, criação/publicação, draft, fallback de tradução, login do Lab, sessão, logout e request autenticada. Os testes do frontend cobrem a preferência do tema e sua aplicação no documento. O E2E cobre a navegação Home → Test Lab → Authentication Lab, persistência do tema e viewport móvel.

## Segurança, acessibilidade e performance

- Senhas são armazenadas com bcrypt; tokens do Lab são opacos e somente seu SHA-256 é persistido.
- Admin usa JWT separado; Lab não compartilha sessão ou credenciais com Admin.
- Entrada é validada com Zod; erros desconhecidos retornam mensagem genérica; Markdown é sanitizado.
- CORS aceita somente a origem configurada; payload JSON tem limite de 200 KB; login possui rate limit simples e lockout no Lab.
- HTML semântico, labels reais, foco visível, headings, landmarks, estados `role=alert/status` e layout responsivo.
- Sem tracking ou scripts analíticos na V1; frontend é um bundle Vite pequeno e conteúdo é carregado sob demanda por rota.

## Próximos débitos técnicos

- Substituir placeholders de identidade, trajetória, links e currículo por dados reais.
- Adicionar migrações versionadas executáveis por uma ferramenta dedicada se o número de ambientes crescer.
- Evoluir refresh token/rotação e armazenamento de sessão do Admin se houver necessidade de revogação administrativa.
- Adicionar testes de acessibilidade automatizados, testes de contrato e cobertura de cenários de concorrência/lockout.
- Adicionar os próximos Labs somente quando houver um comportamento de qualidade bem definido para investigar.
