# QA SaaS Project

Projeto pessoal para praticar automação de testes (E2E, API, integração com banco)
em um app full stack que eu mesmo controlo do início ao fim.

## Stack (por enquanto)

- **Backend:** Node.js + TypeScript + Express
- **Banco:** PostgreSQL (via Docker) — banco de dev (`qa_saas`) e banco de
  teste (`qa_saas_test`) separados
- **Infra local:** Docker Compose
- **Testes:** Vitest (unitário) + Playwright (API/integração — E2E de
  front-end entra numa próxima etapa)

Front-end (React) entra numa próxima etapa.

## Como rodar

Pré-requisito: Docker e Docker Compose instalados.

```bash
docker compose up --build
```

Isso vai:
1. Subir o Postgres na porta `5432`, já criando as tabelas `users` nos
   bancos `qa_saas` (dev) e `qa_saas_test` (teste) — script em
   `backend/db/init.sql`, executado automaticamente na primeira vez.
2. Subir a API Node na porta `3000`.

## Testando manualmente

Com os containers de pé:

```bash
# Verifica se a API está de pé e conectada ao banco
curl http://localhost:3000/health

# Registra um usuário (senha é validada e passa por hash bcrypt)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha1234"}'

# Tenta de novo com o mesmo email -> 409 (email duplicado)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha1234"}'

# Senha curta -> 400
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"outro@exemplo.com","password":"123"}'

# Lista usuários cadastrados (sem expor o hash)
curl http://localhost:3000/users
```

## Estado atual

- [x] Docker Compose com Postgres
- [x] Tabela `users` (id, email, password_hash, created_at)
- [x] API Express rodando em container, conectando no Postgres
- [x] `POST /auth/register` — validação de email/senha, hash com bcrypt, trata email duplicado (409)
- [x] `GET /health`, `GET /users`
- [x] `HttpException` + subclasses (`src/exceptions/HttpException.ts`) — base para
      padronizar erros antes de ligar isso num error handler middleware
- [x] Setup de testes unitários com Vitest + 16 testes cobrindo `HttpException`
- [x] Error handler middleware central (`src/middlewares/errorHandler.ts`)
- [x] Validação de entrada com Zod (`src/schemas/auth.schema.ts` +
      `src/middlewares/validate.ts`, middleware genérico e reusável)
- [x] `/auth/register` refatorado em camadas: rota → middleware de
      validação → service (`src/services/authService.ts`) → error handler
- [x] `asyncHandler` (`src/utils/asyncHandler.ts`) — captura erros de rotas
      `async` no Express 4, que não faz isso sozinho
- [x] 28 testes unitários no total (HttpException, schema Zod, error handler)
- [x] Testes de integração/API com Playwright (`tests/api/`), contra Postgres
      real de teste — 6 testes cobrindo sucesso, duplicidade, validações e normalização
- [ ] Endpoint de login (`POST /auth/login`) com JWT
- [ ] Front-end React com tela de login/cadastro
- [ ] Testes E2E com Playwright no front
- [ ] CI (GitHub Actions) rodando a suite de testes a cada push

## Notas de design

- Validações do `POST /auth/register` (regex de email, senha mínima de 8
  caracteres, email duplicado) foram escritas pensando em cada uma virar,
  no futuro, um caso de teste de API separado.
- Senha nunca é armazenada em texto puro — só o hash gerado pelo `bcrypt`
  (10 salt rounds) vai para o banco.
- O `docker-compose.yml` monta `backend/src` como volume, então o `npm run dev`
  (via `tsx watch`) recarrega automaticamente ao salvar um arquivo.

### Por que `HttpException` (`src/exceptions/HttpException.ts`)

Hoje o `/auth/register` decide "na mão", dentro da própria rota, tanto a
regra de negócio ("email já existe") quanto o status HTTP e o formato da
resposta (`res.status(409).json({ error: "..." })`). Isso mistura duas
responsabilidades diferentes e torna difícil testar a regra de negócio
sem precisar simular request/response do Express.

A ideia da `HttpException` é separar isso: o código de negócio (service)
só faz `throw new ConflictException("email já cadastrado")`, sem saber
nada sobre HTTP. Um único lugar central — o error handler middleware do
Express (próximo passo) — captura qualquer `HttpException` lançada em
qualquer rota e traduz para a resposta HTTP correta.

Decisões de implementação, comentadas diretamente no arquivo:
- `content` é tipado como `unknown`, não `any` — força quem for usar
  esse valor a validar o tipo antes, em vez de confiar cegamente.
- `Object.setPrototypeOf(this, new.target.prototype)` no construtor:
  necessário para o `instanceof HttpException` continuar funcionando
  corretamente em subclasses, já que TypeScript/JS têm uma limitação
  conhecida ao estender classes nativas como `Error`.
- `this.name = this.constructor.name`: faz o erro aparecer com o nome
  da subclasse (ex: `ConflictException`) em vez de `Error` genérico
  quando logado — ajuda a debugar.
- Subclasses nomeadas (`BadRequestException`, `ConflictException`, etc.)
  em vez de sempre instanciar `HttpException` com o número do status na
  mão: evita erro de digitação e deixa o código de negócio mais legível.
  Se um dia quisermos mudar o status padrão de um tipo de erro, muda em
  um lugar só (a subclasse), não em cada `throw` espalhado pelo código.

Testado manualmente (script isolado com `tsx`) confirmando que `status`,
`message`, `content` e `instanceof` se comportam como esperado antes de
integrar isso ao Express.

## Testes

Rodar a suite de testes unitários:

```bash
cd backend
npm test          # roda uma vez e sai
npm run test:watch  # modo watch, útil durante desenvolvimento
```

**Cobertura atual (28 testes, 3 arquivos):**
- `src/exceptions/HttpException.test.ts` — 16 testes (classe base + subclasses)
- `src/schemas/auth.schema.test.ts` — 7 testes (validação e normalização de email/senha)
- `src/middlewares/errorHandler.test.ts` — 5 testes (tradução de erro para resposta HTTP,
  sem mockar servidor Express — só um objeto `res` falso)

### Bug real encontrado pelos testes

O primeiro schema Zod validava o formato do email **antes** de normalizar
(trim + lowercase). Um teste com `"  TESTE@Exemplo.COM  "` (espaços nas
pontas) falhava, porque a validação de formato rodava sobre o valor ainda
sujo. Corrigido invertendo a ordem: `.trim().toLowerCase().email(...)`.
Fica registrado aqui como exemplo prático de por que escrever o teste
"chato" (com espaço/maiúscula, não só o caminho feliz) vale a pena.

## Testes de API / Integração (Playwright)

Diferente dos testes unitários (que rodam isolados, sem rede nem banco),
estes testes batem numa instância **real** da API, rodando de verdade,
conectada a um **Postgres real de teste** (`qa_saas_test` — banco
separado do de desenvolvimento, `qa_saas`).

### Como rodar

Pré-requisito: Postgres precisa estar de pé (o Playwright sobe a API
sozinho, mas não sobe o banco):

```bash
docker compose up -d postgres
```

Depois, na raiz do projeto:

```bash
npm install                # só na primeira vez
npx playwright test --project=api
# ou, se preferir o script já configurado:
npm run test:api
```

O que acontece automaticamente ao rodar o comando acima:
1. Playwright reseta o banco de teste (`globalSetup` → `tests/api/reset-test-db.ts`)
2. Playwright sobe a API (`npm run start:test` dentro de `backend/`), na
   porta `3001`, apontando pro banco de teste — e espera `/health`
   responder antes de continuar
3. Os testes em `tests/api/*.spec.ts` rodam contra essa API real
4. Se você já tiver a API de teste rodando manualmente, `reuseExistingServer`
   evita subir uma segunda instância (só em ambiente local, não em CI)

### Ver o relatório

```bash
npx playwright show-report
```

### Cobertura atual

`tests/api/auth.register.spec.ts` — 6 testes contra `POST /auth/register`:
sucesso (201, sem vazar hash de senha na resposta), email duplicado (409),
corpo vazio (400), email inválido (400), senha curta (400), normalização
de email com espaço/maiúscula.

### Decisões de design

- **Banco de teste separado (`qa_saas_test`) do banco de dev (`qa_saas`).**
  Os dois são criados automaticamente pelo `init.sql` na primeira subida
  do container. Rodar a suíte de testes nunca arrisca sujar os dados que
  você está usando manualmente em desenvolvimento.
- **Email único por teste (`randomUUID()`) em vez de reset entre CADA
  teste individual.** O `globalSetup` já garante uma base limpa no
  início da suíte inteira; como os testes rodam em paralelo
  (`fullyParallel: true`), usar um email fixo repetido faria um teste
  atrapalhar o outro dependendo da ordem de execução. Email único =
  testes independentes entre si sem precisar forçar execução serial.
  O teste de "email duplicado" é a exceção — ele usa o mesmo email duas
  vezes, mas as duas chamadas acontecem dentro do próprio teste, então
  continua não dependendo de nenhum outro teste ter rodado antes.
- **Porta diferente da API de dev** (`3001` para teste vs `3000` para
  dev) — dá pra ter os dois rodando ao mesmo tempo sem conflito,
  útil enquanto se desenvolve e testa em paralelo.
- **`webServer` do Playwright sobe a API automaticamente.** Verificado
  manualmente que o `globalSetup` reseta o banco corretamente entre
  execuções (rodei a suíte duas vezes seguidas e confirmei via `psql`
  que a contagem de registros voltou ao esperado, não acumulou).

```
requisição
   │
   ▼
middleware validate(schema)   ← valida/normaliza usando Zod (src/schemas)
   │  se inválido: lança BadRequestException
   ▼
asyncHandler                  ← captura erro de rota async, repassa pro Express
   │
   ▼
rota (routes/auth.ts)         ← só orquestra: chama o service e responde
   │
   ▼
service (services/authService.ts)  ← regra de negócio (hash, insert, etc.)
   │  se der erro de negócio: lança alguma HttpException
   ▼
errorHandler (middlewares/errorHandler.ts)  ← único lugar que decide
                                                status HTTP + formato da
                                                resposta de erro
```

Cada camada só conhece a camada logo abaixo, e nenhuma delas (exceto a
rota) sabe que está lidando com Express/HTTP — é isso que torna schema,
service e error handler testáveis isoladamente, sem precisar subir
servidor nem Postgres real.

### Descoberta durante os testes

Um dos testes provou algo que valia documentar: o `Object.setPrototypeOf`
no construtor de `HttpException` (prática defensiva comum ao estender
`Error` em TypeScript) **não é estritamente necessário** no setup atual
deste projeto — os testes de `instanceof` passam igual com ou sem essa
linha, porque o target de compilação (`ES2022`) e o jeito como `tsx`
(esbuild) roda o código não sofrem do bug histórico que essa linha
resolve em builds mais antigos (ES5). A linha foi mantida mesmo assim,
como proteção contra uma futura mudança de target/bundler — e agora há
um teste garantindo que, se um dia isso realmente importar, alguém vai
saber na hora (o teste quebra se o comportamento mudar).