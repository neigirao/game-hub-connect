# Crash Coaster — Living Documentation

> **Para desenvolvedores e IAs:** Este arquivo é a fonte primária de verdade do projeto.
> Deve ser atualizado sempre que houver mudança arquitetural, nova feature, decisão importante ou alteração no banco.
> O Claude Code lê este arquivo automaticamente no início de cada sessão.

---

## 1. O Projeto

**Crash Coaster** é um jogo sandbox 2D de construção de montanhas-russas para web browser.

**Tagline:** _"The game where failing is more fun than winning."_

**Emoção central:** O jogador deve pensar constantemente em _"Isso é hilário."_

O entretenimento vem dos acidentes espetaculares, quase-falhas e explosões cômicas — não da perfeição. O jogo recompensa **caos controlado**, não segurança.

**Público:** Desktop-first, brasileiro, casual-gamer, conteúdo compartilhável.

---

## 2. Stack Atual

| Camada               | Tecnologia                             | Versão  |
| -------------------- | -------------------------------------- | ------- |
| Meta-framework       | TanStack Start                         | 1.167.x |
| Roteamento           | TanStack Router                        | 1.168.x |
| UI                   | React                                  | 19.2.0  |
| Estilo               | Tailwind CSS                           | 4.2.x   |
| Componentes          | Shadcn / Radix UI                      | —       |
| Renderização do jogo | HTML5 Canvas (vanilla JS)              | —       |
| Estado do jogo       | Objeto JS global em `play.html`        | —       |
| Backend              | Supabase (PostgreSQL + Auth + Storage) | 2.105.x |
| Auth                 | Google OAuth via Lovable Cloud Auth    | 1.1.x   |
| Hosting              | Cloudflare Workers                     | —       |
| Build                | Vite                                   | 7.3.x   |

> **Pendente do GDD:** PixiJS (renderização GPU), Zustand (state management) — ainda não implementados.

---

## 3. Estrutura de Arquivos

```
/
├── public/
│   ├── play.html          # ENGINE DO JOGO — ~3500 linhas, vanilla JS + Canvas 2D
│   └── home.html          # Landing page de marketing (HTML/CSS puro)
│
├── src/
│   ├── routes/
│   │   ├── __root.tsx     # Layout raiz: SEO global, fontes, onAuthStateChange, QueryClient
│   │   ├── index.tsx      # Redireciona: logado → /campaign, anônimo → /home.html
│   │   ├── login.tsx      # Página de login Google OAuth → redireciona para /campaign
│   │   ├── campaign.tsx   # Grade de fases da campanha
│   │   ├── challenge.tsx  # Desafio diário
│   │   ├── tracks.tsx     # Explorador de pistas públicas
│   │   ├── leaderboard.tsx # Ranking global e mensal
│   │   ├── shop.tsx       # Loja de cosméticos (coins)
│   │   ├── profile.tsx    # Perfil do jogador (XP, blueprints, histórico)
│   │   ├── share.tsx      # Página de compartilhamento de score (og:image dinâmico)
│   │   └── admin/         # Painel admin (guard: is_admin = true)
│   │       ├── index.tsx, levels.tsx, blueprints.tsx, users.tsx
│   │
│   ├── server.ts          # Cloudflare Worker entry — redirect /, og:image, SSR
│   │
│   ├── components/
│   │   └── game-nav.tsx   # Navbar global: links SPA + link Admin condicional
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts          # Cliente Supabase (grava cc_sb_url/cc_sb_key no localStorage)
│   │   ├── client.server.ts   # Cliente admin server-side (bypass RLS)
│   │   ├── auth-middleware.ts # Middleware Bearer token (usa SUPABASE_SERVICE_ROLE_KEY)
│   │   └── types.ts           # Tipos gerados automaticamente (atualizar após migrations)
│   │
│   ├── hooks/
│   │   └── use-is-admin.ts    # Hook que consulta profiles.is_admin para mostrar link Admin
│   ├── components/ui/     # 40+ componentes Shadcn/Radix (não mexer sem necessidade)
│   └── lib/               # Utilitários e error handling
│
├── supabase/
│   ├── config.toml        # Configuração do projeto Supabase (project_id: sekuurohkxqktpllebdd)
│   └── migrations/        # Todas as migrations em ordem cronológica
│
├── docs/
│   ├── GDD.md             # Game Design Document condensado
│   ├── ARCHITECTURE.md    # Arquitetura técnica detalhada
│   ├── DECISIONS.md       # Log de decisões arquiteturais (ADRs)
│   └── CHANGELOG.md       # Histórico de mudanças por versão
│
├── CLAUDE.md              # ESTE ARQUIVO — documentação viva principal
├── package.json
├── vite.config.ts
└── wrangler.jsonc         # Deploy Cloudflare Workers
```

---

## 4. Como o Jogo Funciona Hoje

### Fluxo de jogo

```
Landing (home.html) → Login (Google OAuth) → /campaign → /play.html
```

Após login, o usuário cai em `/campaign` (área logada com fases, stats e links da loja).
Ao acessar diretamente `/play.html` sem sessão ativa, o botão "Entrar com Google"
redireciona para `/login?redirectTo=/play.html`.

### Engine (`public/play.html` — ~3500 linhas)

O jogo inteiro roda em um único arquivo HTML com JS vanilla e Canvas 2D (`<script type="module">`).

**Estado global:**

```js
state = {
  mode: "build" | "test",
  nodes: [
    {
      x,
      y,
      kind:
        "normal" |
        "booster" |
        "brake" |
        "launcher" |
        "loop" |
        "spring" |
        "firework" |
        "ice" |
        "inversor" |
        "cannon" |
        "portal",
    },
  ],
  cart: {
    x,
    y,
    vx,
    vy,
    s,
    v,
    angle,
    alive,
    flying,
    shake,
    panicked,
    finished,
    lastDir,
    timeOnTrack,
    stallTime,
    _gSmooth,
    // cooldown flags (todas declaradas em initCart()):
    _launchCool,
    _loopCool,
    _looping,
    _springCool,
    _fireworkCool,
    _inversorIn,
    _cannonCool,
    _portalCool,
    _iceCool,
    _stalledOut,
  },
  closedLoop: boolean,
  tool:
    "add" |
    "move" |
    "booster" |
    "brake" |
    "launcher" |
    "loop-node" |
    "spring" |
    "firework" |
    "ice" |
    "inversor" |
    "cannon" |
    "portal" |
    "set-start" |
    "set-end" |
    "delete",
  startNodeIdx: number, // índice do nó de EMBARQUE (default: 0)
  endNodeIdx: number, // índice do nó de DESEMBARQUE (-1 = último nó automático)
  scores: { survival, adrenaline, chaos, smoothness, creativity },
  particles: [], // limitado a MAX_PARTICLES = 2000
  ghosts: [],
  debris: [],
  maxSpeed,
  maxG,
  laps,
  nearMisses,
  bestScore,
  failLevel,
};
```

**Física:**

- Interpolação Catmull-Rom para curvas suaves
- Cache de `buildPath()` por hash dos nós — recomputa só quando nós mudam (performance)
- G-force: `Math.hypot(ax, ay) / 9.8`
- Velocidade máxima: ~140 km/h
- 60 FPS com deltaTime normalizado

**Limites de G-force:**

- Seguro: -1G até 4.5G
- Aviso: 4.5G até 5G
- Crash: acima de 5G

**Ferramentas do editor (teclado):**

- `A` — Adicionar nó
- `M` — Mover nó (arrastar fundo vazio = pan câmera)
- `B` — Booster
- `F` — Freio (brake)
- `N` — Lançador (catapulta)
- `G` — Looping 360°
- `T` — Mola (spring)
- `Q` — Fogos (firework)
- `Z` — Gelo (ice)
- `I` — Inversor de gravidade
- `C` — Canhão
- `W` — Portal (requer 2 nós portal na pista)
- `D` — Deletar
- `L` — Toggle loop fechado
- `Space` — Alternar Build/Test
- `Ctrl+Z` — Undo (stack de 60 snapshots)
- `?` — Painel de legenda de atalhos
- `=` / `+` — Zoom In (câmera livre)
- `-` / `_` — Zoom Out (câmera livre)

**Câmera livre no editor (modo Build):**

- `state.cam.freeX/Y/Z` controlam a posição e zoom da câmera livre
- Move tool + arrastar fundo vazio → pan câmera (drag to pan)
- Scroll do mouse → pan horizontal/vertical
- Ctrl+Scroll → zoom centrado no cursor
- Botões `＋`/`－` na toolbar → zoom in/out
- Ao voltar do modo Testar → câmera centraliza no nó de EMBARQUE

**Ferramentas de estação:**

- Botão `INI` (tool `set-start`) → clica em nó → define EMBARQUE
- Botão `FIM` (tool `set-end`) → clica em nó → define DESEMBARQUE
- Estações salvas em `track_data: { nodes, startNodeIdx, endNodeIdx }` (JSONB)
- Backward compatible: blueprints antigos (array) carregam com startNodeIdx=0, endNodeIdx=-1

**Sons (Web Audio API, síntese — zero assets externos):**

- Rail hum (oscilador sawtooth proporcional à velocidade)
- Boost burst
- Crash noise
- Spring, Firework, Ice, Inversor, Cannon, Portal (adicionados na auditoria)

**Sistema de score:**
| Métrica | O que mede |
|---|---|
| Survival | Completar sem crashar |
| Adrenaline | G-forces altas sem crashar |
| Chaos | Quase-mortes e risco |
| Smoothness | Suavidade de aceleração |
| Creativity | Originalidade do traçado |

**Escala de falha (9 níveis):**

1. Trilho vibra → 2. Faíscas → 3. Parafusos soltam → 4. Carrinho balança
   → 5. Pânico dos passageiros → 6. Estrutura entorta → 7. Descarrilamento
   → 8. Explosão → 9. Fantasmas aparecem

### Paleta de cores (CSS vars no play.html)

```css
--danger: #ff4757 /* perigo / crash */ --safe: #2ed573 /* seguro */ --boost: #ffa502
  /* booster / aviso */ --ghost: #70a1ff /* fantasmas */ --boom: #ff7f50 /* explosões */
  --candy: #ff6bd6 /* destaque UI */ --rail: #ffe9a8 /* trilho */ --bg-0: #170c3d
  /* fundo primário */;
```

---

## 5. Banco de Dados (Supabase)

**Project ID:** `sekuurohkxqktpllebdd`
**URL:** `https://sekuurohkxqktpllebdd.supabase.co`

### Schema (migrations em `supabase/migrations/`)

| Tabela                     | Descrição                                                             |
| -------------------------- | --------------------------------------------------------------------- |
| `profiles`                 | Usuários — criado automaticamente via trigger; campo `is_admin`       |
| `blueprints`               | Pistas salvas — `is_featured` protegido por RLS (só admin pode setar) |
| `levels`                   | Fases da campanha (gerenciadas pelo admin)                            |
| `leaderboard_entries`      | Ranking global e mensal — CHECK constraint: valores ≥ 0               |
| `daily_picks`              | Pista do desafio diário                                               |
| `shop_items` / `purchases` | Loja de cosméticos                                                    |

**Views:** `leaderboard_with_profiles` — top scores com rank e username

**RPCs relevantes:** `submit_score`, `award_run_rewards`, `purchase_shop_item`, `toggle_blueprint_like`

**Trigger:** `on_auth_user_created` — cria `profiles` automaticamente ao registrar usuário

**Admin:** `neigirao@gmail.com` tem `is_admin = true` (setado em migration)

> Para regenerar types: `npx supabase gen types typescript --project-id sekuurohkxqktpllebdd > src/integrations/supabase/types.ts`

### Como play.html acessa o Supabase

O `client.ts` grava `cc_sb_url` e `cc_sb_key` no `localStorage` após inicializar.
O `play.html` lê essas chaves e inicializa o `@supabase/supabase-js` via CDN (ESM).
A sessão OAuth fica no localStorage do mesmo domínio — zero friction.

**Atenção:** Se o usuário acessar `/play.html` diretamente (sem passar pelo React app),
`cc_sb_url`/`cc_sb_key` podem não existir. Nesse caso, o botão "Entrar" redireciona
para `/login?redirectTo=/play.html` em vez de tentar OAuth com sbClient = null.

---

## 6. Autenticação

- Provider: Google OAuth (`lovable.auth.signInWithOAuth`)
- Fluxo completo: `/login` → OAuth Google → callback `/?code=` → React troca pelo token → `/campaign`
- Server-side: `auth-middleware.ts` usa `SUPABASE_SERVICE_ROLE_KEY` para validação
- Client-side: `client.ts` persiste sessão no localStorage

**Atenção crítica:** O Worker em `server.ts` redireciona `/` → `/home.html`, mas **não redireciona** se `?code=` ou `?access_token=` estiverem na URL (callbacks OAuth). Sem essa exceção, o token OAuth seria descartado antes do JS processar.

---

## 7. Cloudflare Worker (`src/server.ts`)

O Worker intercepta todas as requests antes do TanStack SSR:

| Rota                                        | Comportamento                                |
| ------------------------------------------- | -------------------------------------------- |
| `GET /` (sem `?code=`)                      | 302 → `/home.html` (elimina hydration flash) |
| `GET /?code=...`                            | Passa para TanStack (callback OAuth)         |
| `GET /api/og/share?score=&stars=&speed=&g=` | Retorna SVG 1200×630 (og:image do /share)    |
| Qualquer outra                              | TanStack SSR                                 |

---

## 8. O que Está Implementado vs. Pendente

### Implementado

- [x] Engine do jogo (física, trilhos, colisões, score)
- [x] Editor de pistas com snapping, splines e Catmull-Rom cacheado
- [x] Sistema de G-force e crash detection
- [x] Partículas, explosões, ghosts (rastros) — limitadas a 2000
- [x] UI completa do jogo (topbar, HUD, painel de score, painel de atalhos)
- [x] Landing page
- [x] Login com Google OAuth → redireciona para `/campaign`
- [x] Infraestrutura Supabase conectada
- [x] Schema do banco completo com RLS e índices
- [x] Tipos TypeScript gerados para todas as tabelas
- [x] Salvar pistas no banco via modal em play.html
- [x] Carregar pistas salvas (lista com load/delete)
- [x] Compartilhar pista via URL (track data codificado em base64)
- [x] Submit automático de score ao leaderboard após corrida
- [x] Câmera dinâmica que segue o carrinho no modo Testar (zoom 1.3x + lerp)
- [x] Modal de resultado pós-corrida — "Jogar de novo" volta para modo edição
- [x] Undo / Ctrl+Z no editor de pistas (stack de 60 snapshots)
- [x] Tela de Perfil `/profile` (React + auth guard + XP bar + blueprints + histórico)
- [x] Ranking Global `/leaderboard` (top 50, season toggle, highlight do usuário atual)
- [x] Campanha `/campaign` (grid de fases, painel de objetivos no play.html via `?level=`)
- [x] Stall detection (parado >3s encerra corrida), velocidade reversa limitada
- [x] Sons Web Audio API — rail hum, boost, crash + 6 novos nós (síntese, zero assets)
- [x] Sistema de Coins/XP — `award_run_rewards` RPC, chamada após cada corrida
- [x] Navbar React global (`GameNav`) — SPA sem full reload, link Admin para admins
- [x] 11 tipos de nó: normal, booster, brake, launcher, loop, spring, firework, ice, inversor, cannon, portal
- [x] Speed trail (motion blur) acima de 70 km/h
- [x] Guard de portal: exige 2 nós portal, caso contrário mostra toast de erro
- [x] Painel de legenda de atalhos colapsável no editor (botão `?`)
- [x] SEO completo — title, og:title, og:description corretos em todas as rotas
- [x] og:image dinâmico em `/share` (SVG gerado no Worker com score/estrelas/speed/g)
- [x] Fontes Google consolidadas no `__root.tsx` (sem FOUC de @import inline)
- [x] `onAuthStateChange` em `RootComponent` — React Query invalida cache no login/logout
- [x] Câmera livre no editor: pan com Move+arrastar fundo, scroll pan, Ctrl+scroll zoom, botões zoom
- [x] Ferramentas de estação INI/FIM — definem EMBARQUE/DESEMBARQUE; salvos em track_data JSONB
- [x] Links "Desafios" e "Pistas da Comunidade" desativados do GameNav (rotas existem mas não linkadas)

- [x] **Painel de Admin** `/admin` completo — admin: `neigirao@gmail.com`
  - [x] Coluna `is_admin` em `profiles` + RLS + guard de rota `/admin/*`
  - [x] `/admin` — dashboard: total users/runs/tracks, top score do mês
  - [x] `/admin/levels` — criar, editar e publicar fases via UI
  - [x] `/admin/blueprints` — moderar pistas públicas (remover, destacar como featured)
  - [x] `/admin/users` — listar, buscar, banir e promover usuários

### Pendente (MVP restante)

- [ ] Perfil: animação de ganho de XP/coins ao receber recompensas
- [ ] Geração de GIF/replay
- [ ] Trilha de fundo (música)

### Implementado (sprint recente)

- [x] Botão "Compartilhar" no modal pós-corrida abre `/share` em nova aba (além de copiar URL)
- [x] Botão 🗑️ em cada blueprint do perfil — apaga com confirmação, atualiza lista localmente
- [x] Challenge page: quando blueprint do desafio foi deletado, mostra aviso em vez de travar
- [x] Loja mostra callout explicando como ganhar coins (jogar Campanha, +100 por estrela) (P2)
- [x] Confirmação antes de comprar item na loja — `window.confirm` com nome e custo do item (P5)
- [x] Challenge page sem desafio exibe CTAs secundários: "Ir para Campanha" e "Jogar Livre" (P4)
- [x] `PlayerAvatar` extraído para `src/components/player-avatar.tsx` — usado em `profile.tsx`, `game-nav.tsx` (A4)
- [x] `SHOP_ITEMS` e `ShopItem` movidos para `src/lib/shop-items.ts` — importado por `shop.tsx` e `profile.tsx` (A12)
- [x] Creativity score com bônus de diversidade: +20 quando ≥3 tipos especiais diferentes e ≥4 nós especiais (G5)
- [x] `.env.example` criado com placeholders das variáveis necessárias (E10)
- [x] `README.md` criado com setup de 5 passos e links para documentação (E13)
- [x] Constantes de física nomeadas em `play.html`: `GRAVITY`, `BOOSTER_ACCEL`, `G_SCALE`, `G_FAIL[]`, etc. (X9)
- [x] CI/CD GitHub Actions: lint + tsc + build + tests + play.html syntax check (E1)
- [x] Pre-commit hooks: husky + lint-staged (ESLint + Prettier em arquivos staged) (E5)
- [x] Vitest configurado com 9 testes: `shop-items` e `creativity-score` (E6)
- [x] `src/lib/game-constants.ts` criado — `XP_PER_LEVEL`, `COINS_PER_STAR`; importado em `profile.tsx` (A5)
- [x] `window.location.href` substituído por `useNavigate()` em `login.tsx`, `profile.tsx`, `shop.tsx`, `tracks.tsx` (A8)
- [x] Content-Security-Policy + security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) adicionados ao Worker em `src/server.ts` (E4)
- [x] Creativity score exibido no leaderboard: coluna `🎨{creativity_score}` (rosa) ao lado de S/A/C (G11)
- [x] `role="toolbar" aria-label="Ferramentas do editor"` na aside tools; `aria-label="Editor de pista" role="img"` no canvas de `play.html` (X7)
- [x] `share.tsx` — `validateSearch` clampeia todos os parâmetros numéricos (`stars` 0-3, `s/a/c` 0-100, `score/speed/g` ≥ 0) — previne DoS visual via URL
- [x] `campaign.tsx` — `LOCK_STARS[Math.min(i, length-1)]` garante que fases 4+ também exigem estrelas em vez de ficar desbloqueadas
- [x] `shop.tsx` — botão de compra desabilitado enquanto qualquer compra estiver em andamento (`buying !== null`), não apenas o item específico
- [x] `login.tsx` — `beforeLoad` redireciona para `/campaign` se sessão já existe; `visibilitychange` reseta loading se usuário cancela OAuth; comentário clarifica o fluxo de redirect
- [x] `shop.tsx` — `handleBuy` valida sessão com `getSession()` antes de chamar RPC; redireciona para `/login` se sessão expirou
- [x] `admin.tsx` — `beforeLoad` envolto em try/catch; erro de rede redireciona para `/` em vez de mostrar tela branca
- [x] Tutorial overlay em `play.html` — aparece automaticamente na Fase 1; 4 steps (boas-vindas, nós, lançar, G-force); botão Pular em cada step; persiste dispensa via `localStorage('cc_tutorial_seen')`
- [x] Rail-catch refatorado com lógica speed-dependente — `speedT` normaliza a velocidade total entre `RAIL_SOFT_SPEED` (400 px/s) e `RAIL_CRUSH_SPEED` (1400 px/s); três outcomes: aterrissagem suave (janela de vNormal fecha com velocidade), quique (restitution 0.55→0.78, atrito 0.85→0.65, toast "RONCOU" em speedT>0.6), esmagamento (restitution >1 expulsa o carrinho, +fail level, smoke)
- [x] Mobile MVP em `play.html` — viewport `device-width`; media query ≤767px: grid reordenado (tools vira strip horizontal inferior scrollável), rightpanel oculto, topbar compacta, levelPanel e legend-panel reposicionados; pointer events já funcionavam nativamente no mobile

### Pendente (pós-MVP / V2+)

- [ ] Migrar engine para PixiJS
- [ ] Zustand para state management
- [ ] Skins e sistema de gacha
- [ ] Mobile-first (touch events, viewport responsivo)
- [ ] Creator economy / marketplace
- [ ] Temporadas e eventos

---

## 9. Armadilhas Conhecidas (não repetir)

| Armadilha                                            | Detalhe                                                                                                                                                                                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stray brace em play.html                             | Um `}` extra quebra o `<script type="module">` inteiro — nenhum código executa                                                                                                                                               |
| Worker redirect intercepta OAuth                     | Nunca redirecionar `/` se `?code=` estiver na URL — o token OAuth seria descartado                                                                                                                                           |
| sbClient = null em play.html                         | Usuário que vai direto para /play.html não tem cc_sb_url no localStorage; usar optional chaining silencia o erro mas o clique vira no-op                                                                                     |
| @import inline causa FOUC                            | Não adicionar `@import url(google fonts)` dentro de `<style>` em componentes React — consolidar em `__root.tsx` head links                                                                                                   |
| `<a href>` vs `<Link to>`                            | Links internos de rotas React devem usar `<Link to>`, não `<a href>` — caso contrário perdem o cache do QueryClient a cada navegação                                                                                         |
| canvasPoint() deve converter com câmera              | Após adicionar câmera livre, `canvasPoint()` deve usar `cam.x + (sx - W/2) / cam.z` — sem isso, cliques em nós ficam deslocados quando câmera está em posição diferente do centro                                            |
| track_data formato duplo                             | Blueprints antigos têm track_data como array JSON; novos têm `{nodes, startNodeIdx, endNodeIdx}`. Load code deve checar `Array.isArray(td) ? td : td.nodes`                                                                  |
| OAuth redirect_uri deve ir direto pra `/campaign`    | `lovable.auth.signInWithOAuth` com `redirect_uri: origin` causa salto duplo via `IndexRedirect` e pode flashar `/home.html` se o `getSession()` chegar antes do cookie. Sempre usar `origin + "/campaign"` para login do app |
| `head({ search })` não compila no TanStack atual     | A função `head` em `createFileRoute` não recebe `search` como prop; usar `head({ match })` e ler `match.search` (com cast para o schema do `validateSearch`)                                                                 |
| Toolbar do editor estoura viewport                   | `.tools` é grid 2 colunas com `overflow-y:auto`. Ao adicionar nova ferramenta, manter ícones em 22×22 e label em 8px para caber em 769px de altura                                                                           |
| #levelPanel sobrepõe toolbar                         | O painel de campanha é `position:fixed` — se `left` for menor que a largura da toolbar+padding ele cobre os botões. Valor correto: `left: 178px` (14px grid-padding + 150px tools + 14px gap)                                |
| index.tsx getSession() vs OAuth callback             | Quando `/?code=` chega (OAuth callback), `getSession()` retorna null porque o Supabase ainda está trocando o code. Usar `onAuthStateChange('SIGNED_IN')` para aguardar a sessão ser estabelecida                             |
| `redirect` como nome de variável em `validateSearch` | Nomear a search param `redirect` sombreia a função `redirect` do TanStack Router importada no mesmo arquivo. Usar `redirectTo` ou outro nome para evitar o conflito silencioso                                               |
| `beforeLoad` sem try/catch em rotas protegidas       | `getSession()` e queries Supabase dentro de `beforeLoad` podem lançar erros de rede → tela branca. Sempre envolver em try/catch re-lançando apenas os redirects do TanStack (`e._isRedirect` ou `e instanceof Response`)     |

---

## 10. Princípios de Desenvolvimento

### Filosofia do produto

- **Caos controlado** é o objetivo, não perfeição
- Falhas devem ser engraçadas, progressivas e compartilháveis
- Nunca pay-to-win — monetização só por cosméticos
- UI deve lembrar brinquedos e painéis de parque temático

### Direção visual

- Estilo: **Theme Park Toy** + influência Cartoon Network
- Formas arredondadas, cores vibrantes, animações exageradas
- Nunca: realismo extremo, sangue, horror, texturas complexas

### Código

- `play.html` é o coração do jogo — sempre verificar sintaxe com `node --check` após editar
- Não introduzir breaking changes na física sem testar o score system
- Sempre atualizar `src/integrations/supabase/types.ts` após migrations
- Commits devem ser descritivos com escopo (ex: `fix(play.html):`, `feat(campaign):`)

### Performance

- Target: 60 FPS em notebooks modestos e browsers modernos
- `buildPath()` tem cache por hash dos nós — não chamar fora do cache
- Partículas limitadas a `MAX_PARTICLES = 2000`
- Futuramente: Web Workers para física, object pooling para partículas

---

## 11. Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Verificar sintaxe do play.html (rodar após qualquer edição no script)
node -e "
const fs = require('fs'), html = fs.readFileSync('public/play.html','utf8'), lines = html.split('\n');
let end = -1; for(let i=812;i<lines.length;i++) if(lines[i].includes('</script>')){end=i;break;}
fs.writeFileSync('/tmp/pc.mjs', lines.slice(813,end).join('\n'));
" && node --check /tmp/pc.mjs && echo "✓ Sintaxe OK"

# Lint + format
npm run lint
npm run format

# Gerar tipos Supabase (após migrations)
npx supabase gen types typescript --project-id sekuurohkxqktpllebdd > src/integrations/supabase/types.ts

# Deploy (Cloudflare Workers)
npx wrangler deploy
```

---

## 12. Roadmap

| Fase    | Foco                                                                                            |
| ------- | ----------------------------------------------------------------------------------------------- |
| **MVP** | ~~Campanha~~ ✅ · ~~Física melhorada~~ ✅ · ~~Navegação SPA~~ ✅ · Replay/GIF · Trilha de fundo |
| **V2**  | Skins + gacha, PixiJS, temporadas, mobile                                                       |
| **V3**  | Creator economy, marketplace, desafios especiais                                                |

---

## 13. Contatos e Acessos

| Papel                     | Detalhe                               |
| ------------------------- | ------------------------------------- |
| Admin principal           | `neigirao@gmail.com`                  |
| Supabase project          | `sekuurohkxqktpllebdd`                |
| Repositório               | `neigirao/game-hub-connect`           |
| Branch de desenvolvimento | `claude/understand-application-WSjdS` |

---

## Como Atualizar Este Arquivo

**Atualizar o CLAUDE.md sempre que:**

- Uma nova tabela for criada no banco
- Uma feature for implementada ou removida
- A stack tecnológica mudar (nova lib, remoção de lib)
- Uma decisão arquitetural importante for tomada
- Uma armadilha nova for descoberta (seção 9)

**Atualizar `docs/CHANGELOG.md` a cada PR mergeado.**
**Registrar decisões importantes em `docs/DECISIONS.md`.**
