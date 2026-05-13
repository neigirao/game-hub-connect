# Arquitetura Técnica — Crash Coaster

> Última atualização: 2026-05-13
> Mantenha este arquivo sincronizado com mudanças estruturais.

---

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│                                                         │
│  ┌──────────────┐      ┌──────────────────────────────┐ │
│  │  home.html   │      │         play.html            │ │
│  │  (Marketing) │      │  (Game Engine — Canvas + JS) │ │
│  └──────┬───────┘      └──────────────┬───────────────┘ │
│         │                             │                  │
│  ┌──────▼───────────────────────────▼───────────────┐  │
│  │              React App (TanStack Start)           │  │
│  │   /login  /  __root  /  index (→ home.html)      │  │
│  └──────────────────────────┬────────────────────────┘  │
└─────────────────────────────┼──────────────────────────┘
                              │
              ┌───────────────▼───────────────┐
              │    Cloudflare Workers          │
              │    (Hosting + Edge Runtime)    │
              └───────────────┬───────────────┘
                              │
              ┌───────────────▼───────────────┐
              │         Supabase              │
              │  PostgreSQL / Auth / Storage  │
              │  project: sekuurohkxqktpllebdd│
              └───────────────────────────────┘
```

---


## Mapa de Documentação (onde está cada assunto)

| Assunto | Arquivo |
|---|---|
| Arquitetura técnica, integrações, fluxos e inventário macro de APIs | `docs/ARCHITECTURE.md` |
| Matriz detalhada de APIs por recurso e arquivo | `docs/API_MATRIX.md` |
| Decisões arquiteturais (ADRs) | `docs/DECISIONS.md` |
| Evolução por sessão e mudanças entregues | `docs/CHANGELOG.md` |
| Backlog e prioridades (MVP → V2 → V3) | `docs/ROADMAP.md` |
| Visão de game design e pilares de produto | `docs/GDD.md` |
| Banco (DDL e evolução de schema) | `supabase/migrations/*.sql` |

---

## Camadas da Aplicação

### 1. Game Engine (`public/play.html`)

Arquivo standalone com ~1800 linhas. Não depende do React ou de nenhuma lib externa.

**Responsabilidades:**
- Renderização via Canvas 2D
- Loop de física a 60 FPS
- Editor de pistas (add/move/delete nós)
- Simulação do carrinho (velocidade, G-force, crash)
- Sistemas de score, partículas, explosões, ghosts
- UI do jogo (topbar, HUD, painel de ferramentas)

**Padrão de estado:** Objeto global mutável
```js
const state = { mode, nodes, cart, tool, scores, ... }
```

**Renderização:** `requestAnimationFrame` → `tick()` → Canvas draw calls

**Física:** Integração Euler simples com deltaTime normalizado
```
E_total = mgh + ½mv²
G-force = Math.hypot(ax, ay) / 9.8
```

**Curvas:** Interpolação Catmull-Rom entre nós do usuário

---

### 2. React App (`src/`)

Meta-framework TanStack Start rodando no Cloudflare Workers.

**Responsabilidades atuais:**
- Roteamento completo de produto (`/campaign`, `/challenge`, `/tracks`, `/leaderboard`, `/profile`, `/shop`, `/admin/*`)
- Autenticação Google OAuth
- Shell React global com navegação persistente
- Páginas de dados conectadas ao Supabase (perfil, ranking, trilhas, loja, desafio diário e admin)

**Não faz hoje:** O loop principal do jogo ainda roda em `play.html` (Canvas standalone), fora do React.

**Estrutura principal de rotas:**
```
/              → decide por sessão (anônimo: /home.html, logado: /campaign)
/login         → login OAuth Google
/campaign      → seleção de fases
/challenge     → desafio diário
/tracks        → comunidade (pistas públicas + likes)
/leaderboard   → ranking global/mensal
/profile       → perfil do jogador
/shop          → loja de cosméticos
/share         → página de compartilhamento
/admin/*       → dashboard e painéis de moderação
```

**Providers disponíveis (já configurados):**
- `QueryClientProvider` (TanStack Query) — pronto para data fetching
- Supabase client — pronto para operações de banco

---

### 3. Supabase

**Configuração atual:** Projeto ativo com schema de produção e migrations versionadas em `supabase/migrations`.

**Clientes disponíveis:**

| Arquivo | Uso | Contexto |
|---|---|---|
| `client.ts` | Operações browser | Client-side, persiste sessão |
| `client.server.ts` | Operações admin | Server-side, bypass RLS |

**Auth flow:**
```
Usuário → /login → Google OAuth → Supabase Auth → redirect → /home.html
                                        ↓
                              JWT armazenado no localStorage
```

**Middleware (`auth-middleware.ts`):**
Valida Bearer token para proteger rotas de API futuras.

---

### 4. Cloudflare Workers

**Arquivo de config:** `wrangler.jsonc`

- Entry point: `src/server.ts`
- Compatibility date: `2025-09-24`
- Deploy command: `npx wrangler deploy`

---

## Fluxo de Dados Atual

```
Usuário autentica no React App
        │
        ▼
Supabase session é reutilizada no play.html
        │
        ▼
play.html carrega fase/blueprint (quando informado por URL)
        │
        ▼
Usuário testa pista → score calculado localmente
        │
        ▼
Score e recompensas enviados para Supabase
        │
        ▼
Páginas React consomem dados atualizados (perfil/ranking/desafio/tracks/admin)
```

---

## Fluxo de Dados Planejado (pós-banco)

```
Autenticação (JWT do Supabase)
        │
        ▼
Carregar blueprints do usuário (Supabase → play.html)
        │
        ▼
Usuário edita/cria pista
        │
        ▼
Testar → score gerado
        │
        ▼
Salvar blueprint (play.html → Supabase)
        │
        ▼
Publicar → leaderboard atualizado
```

---


## APIs consumidas (inventário prático)

### Supabase Auth
- `supabase.auth.getSession()` — valida sessão nas rotas React e no redirect inicial.
- `supabase.auth.onAuthStateChange()` — atualiza UI global (navbar/avatar) em tempo real.
- `signInWithOAuth({ provider: "google" })` — login.

### Supabase Database (REST via client)
- Tabelas consumidas diretamente: `profiles`, `blueprints`, `leaderboard_entries`, `levels`, `daily_picks`, `blueprint_likes` e tabelas auxiliares de loja/equipamentos.
- Views consumidas: `leaderboard_with_profiles` (ranking agregado).
- Operações comuns: `select`, `insert`, `update`, `delete`, `order`, `limit`, filtros por temporada e usuário.

### Supabase RPC
- `award_run_rewards(...)` — aplica XP/coins após corrida.
- `toggle_blueprint_like(...)` — alterna curtida de pista e retorna contagem atualizada.

### Realtime
- Listener em `leaderboard_entries` para atualizar ranking sem refresh manual.

### APIs no `play.html`
- `GET /rest/v1/levels` (via client Supabase) para carregar fase por `?level=`.
- `GET /rest/v1/blueprints` para abrir pista por `?blueprint=`.
- `POST /rest/v1/leaderboard_entries` para publicar resultado da corrida.

> Observação: a aplicação não mantém uma API HTTP própria extensa hoje; o backend principal é o Supabase (Auth + PostgREST + RPC + Realtime).

---

## Banco de dados (estado atual)

**Fonte da verdade do schema:** pasta `supabase/migrations/` (versionada em SQL).

**Domínios principais:**
- **Usuários:** `profiles` (username, level, xp, coins, flags como `is_admin`/`is_banned`).
- **Conteúdo:** `blueprints` (pistas), `levels` (campanha), `daily_picks` (curadoria diária).
- **Competição:** `leaderboard_entries` + view de ranking.
- **Social:** `blueprint_likes`.
- **Economia:** funções e tabelas de suporte para compras/equipamentos da loja.

**Segurança de dados:**
- RLS habilitado com policies por papel/contexto.
- Fluxos administrativos protegidos por `profiles.is_admin = true`.
- Chave de service role usada apenas server-side (`client.server.ts`).

---

## Mapa de código (onde fica cada parte)

- **Game loop e editor:** `public/play.html`
- **Landing/SEO estático:** `public/home.html`, `public/sitemap.xml`, `public/robots.txt`
- **Roteamento React:** `src/routes/*`
- **Admin:** `src/routes/admin/*`
- **Navegação global:** `src/components/game-nav.tsx`
- **Integração Supabase:** `src/integrations/supabase/*`
- **Tipos Supabase gerados/espelhados:** `src/integrations/supabase/types.ts`
- **Config de deploy edge:** `wrangler.jsonc`, `src/server.ts`

---

## Decisões de Renderização

**Hoje:** HTML5 Canvas 2D em `play.html`
- Simples de implementar
- Sem dependências externas
- Suficiente para o MVP

**Planejado (V2+):** Migrar para PixiJS
- GPU-accelerated (WebGL)
- Melhor suporte a partículas em massa
- Sprites e texturas complexas
- Ver `docs/DECISIONS.md` para o racional completo

---

## Decisões de Estado

**Hoje:** Objeto JS global em `play.html`
- Simples, sem boilerplate
- Mutação direta (não imutável)
- Sem persistência

**Planejado (V2+):** Zustand
- State management reativo
- Fácil integração com React
- Suporte a middleware (persist, devtools)

---

## Segurança

- RLS (Row Level Security) habilitado no Supabase
- Policies aplicadas por domínio (usuário, conteúdo, competição e admin), revisadas a cada migration
- `client.server.ts` usa service role key — nunca expor no browser
- Auth middleware valida JWT em todas as rotas de API

---

## Performance Targets

| Métrica | Target |
|---|---|
| FPS do jogo | 60 FPS constante |
| Dispositivo mínimo | Notebook modesto, browser moderno |
| Carga inicial | < 3s em conexão regular |
| Futuro mobile | < 30ms frame time |

**Estratégias planejadas:**
- Web Workers para física pesada
- Object pooling para partículas
- Compressão de dados de replay
- Delta simulation para replay

---

## Integrações Externas

| Serviço | Status | Uso |
|---|---|---|
| Supabase | Ativo | Banco, Auth, Storage |
| Google OAuth | Ativo | Login |
| Cloudflare | Ativo | Hosting/CDN |
| Sentry | Planejado | Crash analytics |
| PostHog | Planejado | Product analytics |
| Upstash Redis | Planejado | Cache de ranking |
| Resend | Planejado | Emails transacionais |
