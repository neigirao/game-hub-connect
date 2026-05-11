# Arquitetura Técnica — Crash Coaster

> Última atualização: 2026-05-11
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
- Roteamento (`/`, `/login`)
- Autenticação Google OAuth
- Shell para futuras rotas React (dashboard, perfil, admin)

**Não faz hoje:** O jogo em si não usa React — vive em `play.html`.

**Estrutura de rotas:**
```
/           → redireciona para /home.html (landing page estática)
/login      → formulário OAuth Google
/__root     → layout raiz (providers, error boundary)
```

**Providers disponíveis (já configurados):**
- `QueryClientProvider` (TanStack Query) — pronto para data fetching
- Supabase client — pronto para operações de banco

---

### 3. Supabase

**Configuração atual:** Projeto criado, sem tabelas.

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
Usuário abre play.html
        │
        ▼
Canvas inicializa (sem dados do servidor)
        │
        ▼
Usuário constrói pista (estado local em memória)
        │
        ▼
Usuário testa → física roda → score calculado
        │
        ▼
[FALTA] Salvar pista no Supabase
[FALTA] Publicar para ranking
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
- Sem tabelas expostas ainda — configurar policies ao criar cada tabela
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
