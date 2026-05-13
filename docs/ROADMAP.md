# Roadmap de Tarefas — Crash Coaster

> Backlog priorizado por fase. Cada tarefa tem contexto, critério de aceite e dependências.
> Atualizar conforme as sessões avançam. Marcar com ✅ ao concluir.

---

## Como usar este arquivo

- **Status:** `[ ]` pendente · `[~]` em andamento · `[x]` feito
- **Prioridade:** 🔴 bloqueante · 🟠 alta · 🟡 média · 🟢 nice-to-have
- Cada tarefa tem **critério de aceite** claro para qualquer dev/IA saber quando está "done"

---

## 🔍 INVESTIGAÇÕES PENDENTES

### 🟠 P1 — Restaurar landing `home.html` na rota `/`

**Contexto:** O CLAUDE.md descreve o fluxo `Landing (home.html) → Login → Jogo`, mas hoje `src/routes/index.tsx` redireciona direto para `/login` (não-autenticado) ou `/campaign` (autenticado). A landing rica em `public/home.html` nunca é exibida no preview/published — daí a sensação de "sumiu a home anterior".

**Hipótese:** Quando consolidamos o roteamento via TanStack (#1) e adicionamos auth-guard global, o redirect substituiu o `window.location = '/home.html'` antigo.

**Decisão a tomar:**
- (a) Manter redirect atual e aposentar `home.html` (assumir `/campaign` como nova landing pós-login).
- (b) Servir `home.html` na raiz para visitantes anônimos e só redirecionar autenticados para `/campaign`.
- (c) Migrar o conteúdo de `home.html` para uma rota React `src/routes/index.tsx` (melhor SEO/SSR, alinha com `tanstack-route-architecture`).

**Critério de aceite:** Visitante anônimo abre `/` e vê uma landing real (ou home.html, ou rota React equivalente). Documentação atualizada em CLAUDE.md.

**Recomendação:** opção (c) — landing nativa React com `head()` próprio.

---

## FASE MVP — O que falta para ter um jogo completo

### ✅ 🔴 P1 — Tela de Perfil do Usuário

**Contexto:** O banco já tem `profiles` com `coins`, `xp`, `level`. Não existe nenhuma tela React mostrando esses dados ao jogador.

- [x] `src/routes/profile.tsx` — rota `/profile` com layout React
- [x] Buscar `profiles` do Supabase pelo `user.id` da sessão atual
- [x] Exibir: avatar (Google), username, level, XP (barra de progresso), coins
- [x] Listar as últimas 5 pistas salvas do jogador (query em `blueprints`)
- [x] Listar os últimos 5 scores no leaderboard (query em `leaderboard_entries`)
- [x] Botão "Jogar" que leva para `/play.html`
- [x] Proteger rota: redirecionar para `/login` se não autenticado

**Critério de aceite:** ✅ Usuário logado vê seu perfil com dados reais do banco. Não logado é redirecionado.

**Concluído em:** Sessão 5 — 2026-05-11

**Dependências:** Auth funcionando ✅, tabela `profiles` ✅

---

### ✅ 🔴 P1 — Ranking Global (Leaderboard)

**Contexto:** A view `leaderboard_with_profiles` já existe no banco com `rank()`, username e métricas. Falta a tela React.

- [x] `src/routes/leaderboard.tsx` — rota `/leaderboard`
- [x] Query na view `leaderboard_with_profiles` com filtro de `season = 'global'`
- [x] Tabela com colunas: rank, avatar/username, total_score, max_speed_kmh, max_g_force, laps
- [x] Highlight da linha do usuário atual
- [x] Toggle de temporada (global / mês atual `YYYY-MM`)
- [x] Link para a pista do score (`blueprint_id` → compartilhar)
- [x] Atualização em tempo real com Supabase Realtime (INSERT listener → refetch silencioso + badge "● AO VIVO")

**Critério de aceite:** ✅ Tabela com top 50 scores mostrando ranking, username e métricas. Usuário atual destacado.

**Concluído em:** Sessão 6 — 2026-05-11

**Dependências:** `leaderboard_with_profiles` view ✅, `submitScore` funcionando ✅

---

### ✅ 🟠 P2 — Tela de Campanha (Fases)

**Contexto:** A tabela `levels` existe com `title`, `objectives`, `star1/2/3_score`, `starter_track`. Falta a tela de seleção de fases e a integração com `play.html`.

- [x] `src/routes/campaign.tsx` — rota `/campaign` com grid de fases
- [x] Buscar `levels` com `is_published = true` ordenados por `order_index`
- [x] Card de fase: título, cenário, preview SVG da pista, estrelas, botão "Jogar"
- [x] Ao clicar "Jogar", redirecionar para `/play.html?level={id}`
- [x] `play.html` — detectar `?level=` na URL, buscar no Supabase REST e carregar `starter_track`
- [x] `play.html` — painel de objetivos lateral (`#levelPanel`) com título, objetivos e thresholds de estrelas
- [ ] Admin: formulário para criar/publicar níveis (`is_admin = true`) — pós-MVP
- [x] Seed: 3 fases criadas via migration SQL (`Primeira Descida`, `Loopings e Boosters`, `Caos Total`)

**Critério de aceite:** ✅ Grid de 3 fases funcionais. Clicar carrega a pista e mostra painel de objetivos no play.html.

**Concluído em:** Sessão 7 — 2026-05-11

**Dependências:** Tabela `levels` ✅, `play.html` com suporte a URL params ✅

---

### 🟠 P2 — Melhorar física e sensação do jogo

**Contexto:** A física atual funciona mas tem edge cases e falta polish.

- [x] **Stall detection:** exibir "PARADO! 😴" se o carrinho ficar parado por >3s e encerrar o run
- [x] **Velocidade mínima reversa:** impedir que o carrinho volte indefinidamente com velocidade negativa alta
- [x] **Novo nó: Lançador** — catapulta que expulsa o carrinho para o ar propositalmente (kind: `launcher`)
- [x] **Looping 360°** — nó especial que força o carrinho a fazer uma volta completa sem crash (kind: `loop`, tecla G) — física circular com gravidade real, speed mínima de 50 km/h, crash se lento
- [x] **Efeito de túnel:** se o carrinho passa por um ponto muito rápido, deixar rastro de velocidade (motion blur simples)
- [x] **Sons** — Web Audio API com 3 sons: trilho normal, booster, crash (sem assets externos, gerado por síntese)

**Critério de aceite:** Cada item verificado individualmente. Sons devem funcionar sem CORS e sem arquivos externos.

---

### 🟡 P3 — Sistema de Coins e XP

**Contexto:** As colunas `coins` e `xp` existem em `profiles` mas nunca são atualizadas.

- [x] Definir tabela de recompensas: corrida completa = +50 XP, crash = +10 XP (caos é recompensado), nova estrela = +100 coins
- [x] Criar função Supabase `award_run_rewards(user_id, stars, crashed)` para calcular e atualizar atomicamente
- [x] Chamar essa função ao `completeRun()` no `play.html`
- [x] Tela de perfil exibir a animação de ganho de XP/coins — RewardBanner com count-up animado (useCountUp hook + keyframes rewardSlide/rewardPop/rewardGlow)
- [x] Definir limiares de level: 1 level = 500 XP (calculado na função)

**Critério de aceite:** ✅ Após corrida, XP e coins são incrementados no banco e visíveis na tela de perfil.

**Dependências:** Tela de perfil (P1) ✅

---

### 🟡 P3 — Navegação e Shell React

**Contexto:** Hoje o app tem só `/login` e `/`. Não há navegação entre telas.

- [x] Navbar persistente no `__root.tsx` com links: Jogar, Campanha, Ranking, Perfil
- [x] Navbar mostra avatar do usuário logado ou botão "Entrar" se não logado
- [ ] Rota `/play` que serve o `play.html` num iframe ou redireciona para `/play.html`
- [x] Loading states com Skeleton (PulseSkeleton) para todas as queries de banco
- [x] Error boundary com mensagem amigável para falhas de rede (PageError component + retryCount pattern)

**Critério de aceite:** Usuário consegue navegar entre todas as telas sem usar URL manual.

---

## FASE MVP — Painel de Administração

> **Admin principal:** `neigirao@gmail.com`
> Autenticação: verificar `profiles.is_admin = true` (coluna a adicionar) para liberar acesso.

### ✅ 🔴 P1 — Infraestrutura de admin

- [x] Coluna `is_admin BOOLEAN DEFAULT false` já existia em `profiles` (migration 001)
- [x] Setar `is_admin = true` para `neigirao@gmail.com` via migration SQL
- [x] RLS policy: somente `is_admin = true` pode INSERT/UPDATE/DELETE em `levels` (migration 003)
- [x] Hook `useIsAdmin()` — `src/hooks/use-is-admin.ts`
- [x] Guard de rota: `beforeLoad` em `src/routes/admin.tsx` redireciona para `/` se não for admin

**Critério de aceite:** ✅ Somente `neigirao@gmail.com` consegue acessar `/admin`. Qualquer outro usuário é redirecionado.

**Concluído em:** Sessão 11 — 2026-05-11

---

### ✅ 🔴 P1 — Admin: Gerenciar Fases (`/admin/levels`)

**Contexto:** Hoje as fases são criadas via SQL direto. O admin precisa de uma UI para criar, editar e publicar fases sem precisar de acesso ao banco.

- [x] `src/routes/admin/levels.tsx` — listagem de todas as fases (publicadas e rascunhos)
- [x] Formulário de criação/edição: título, cenário (dropdown), objetivos (JSON ou lista dinâmica)
- [x] Campos: `star1_score`, `star2_score`, `star3_score`, `reward_coins`, `reward_xp`, `order_index`
- [x] Toggle `is_published`: draft/publicado com toggle visual
- [x] Preview da pista antes de publicar (MiniTrack SVG inline)
- [x] Salvar via Supabase client com RLS admin
- [x] Layout route `src/routes/admin.tsx` com sub-navbar admin
- [x] Link "🔐 Admin" no GameNav (visível apenas para admins)

**Critério de aceite:** ✅ Admin consegue criar uma nova fase, definir objetivos e publicar — sem tocar no banco diretamente.

**Concluído em:** Sessão 11 — 2026-05-11

---

### ✅ 🟠 P2 — Admin: Moderação de Blueprints (`/admin/blueprints`)

- [x] Listar todas as pistas públicas (`blueprints.is_public = true`)
- [x] Visualizar preview SVG de cada pista
- [x] Ação: remover pista (marcar `is_public = false`)
- [x] Ação: promover pista como "Featured" (coluna `is_featured BOOLEAN` adicionada)
- [x] Filtro por destaque + busca por nome/usuário

**Critério de aceite:** ✅ Admin consegue remover pistas inadequadas e destacar pistas de qualidade.

**Concluído em:** Sessão 12 — 2026-05-11

---

### ✅ 🟠 P2 — Admin: Gestão de Usuários (`/admin/users`)

- [x] Listar todos os `profiles` com username, email, level, coins, XP, data de criação
- [x] Busca por username ou email
- [x] Ação: banir usuário (coluna `is_banned BOOLEAN` adicionada)
- [x] Ação: conceder/revogar `is_admin`

**Critério de aceite:** ✅ Admin consegue ver e gerenciar todos os usuários sem acessar o banco diretamente.

**Concluído em:** Sessão 12 — 2026-05-11

---

### ✅ 🟡 P3 — Admin: Dashboard de métricas (`/admin`)

- [x] Total de usuários registrados
- [x] Total de corridas completadas (total de `leaderboard_entries`)
- [x] Total de pistas salvas (total de `blueprints`)
- [x] Top score do mês atual
- [x] Lista das últimas 8 corridas com username e timestamp
- [x] Links rápidos para os outros painéis admin

**Critério de aceite:** ✅ Admin vê um overview do estado do jogo em tempo real.

**Concluído em:** Sessão 12 — 2026-05-11

---

## FASE V2 — Pós-MVP

### 🟠 SEO — Indexação do Crash Coaster no Google

**Contexto:** A `home.html` atual tem apenas `<title>` e `<meta viewport>`. Para ranquear bem no Google é preciso cobrir on-page SEO, dados estruturados, Core Web Vitals e sinais de autoridade.

**Estado atual da `home.html`:**
- ✅ `<title>` descritivo
- ✅ `<meta description>`
- ✅ Open Graph / Twitter Card
- ✅ Canonical URL
- ✅ JSON-LD VideoGame schema
- ✅ `sitemap.xml`
- ✅ `robots.txt`
- ❌ Imagens sem `alt` text
- ❌ Sem preload de recursos críticos

#### On-page básico (impacto imediato)
- [x] `<meta name="description">` — 150–160 chars descrevendo o jogo em PT-BR
- [x] Open Graph: `og:title`, `og:description`, `og:image` (screenshot 1200×630 do jogo), `og:url`, `og:type`
- [x] Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [x] `<link rel="canonical" href="https://crashcoaster.app/">` (atualizar para URL real de produção)
- [x] `<meta name="robots" content="index, follow">`
- [x] `<html lang="pt-BR">` — sinalizar idioma para o Google

#### Arquivos de descoberta
- [x] `public/sitemap.xml` — listar `/`, `/campaign`, `/leaderboard` com `<lastmod>` e `<priority>`
- [x] `public/robots.txt` — `Allow: /`, apontar para sitemap

#### Dados estruturados (JSON-LD)
- [x] `VideoGame` schema em `home.html` — nome, description, URL, applicationCategory, genre, offer price
- [ ] `BreadcrumbList` nas páginas internas (`/campaign`, `/leaderboard`)
- [x] `FAQPage` JSON-LD na home com 5 perguntas sobre o jogo

#### Performance e Core Web Vitals
- [x] `<link rel="preload">` para a fonte Fredoka (carregamento não-bloqueante)
- [ ] Substituir imagens por formato WebP e adicionar `width`/`height` para evitar CLS
- [ ] Lazy loading em imagens abaixo do fold (`loading="lazy"`)
- [ ] Minificar o CSS inline da `home.html` (atualmente tudo inline, pode ser crítico)
- [ ] Verificar LCP < 2.5s, FID < 100ms, CLS < 0.1 via Lighthouse

#### Conteúdo e autoridade
- [x] H1 único: nav `<h1>` virou `<span class="brand">`, hero mantém o único H1
- [x] Seção "Comece a jogar agora" com texto indexável e links para /campaign, /leaderboard, /play.html
- [x] Links internos: nav e footer apontam para /campaign, /leaderboard, /login
- [x] Meta description únicos por rota React (`/campaign`, `/leaderboard`, `/profile`)

**Critério de aceite:** Lighthouse SEO score ≥ 90 na `home.html`. Página aparece indexada no Google Search Console em até 7 dias após deploy.

**Dependências:** URL de produção definida, domínio configurado no Cloudflare.

---

### ✅ 🟠 Tier 2 — Retenção e viralidade

- [x] **E** — Gravação de vídeo do crash via MediaRecorder API (canvas.captureStream → .webm)
  - Inicia ao entrar em modo Testar, para no completeRun
  - Botão "Salvar Vídeo" aparece no modal de resultado apenas em crashes
- [x] **F** — Leaderboard por fase no modal pós-corrida
  - Top-5 do `leaderboard_entries` filtrado por `level_id` + `season=global`
  - Row com highlight "você" para o usuário atual
- [x] **G** — Desafio do Dia (`/challenge`)
  - Tabela `daily_picks` (PK: date, FK: blueprint_id)
  - Admin define pista do dia via botão "📅 Daily" em `/admin/blueprints`
  - Página `/challenge` mostra a pista + leaderboard diário em tempo real
  - `submitScore` submete com `season='daily-YYYY-MM-DD'` quando `?daily=` está na URL

**Concluído em:** Sessão 14 — 2026-05-12

---

### 🟢 Conjunto de peças e customização de cenário

**Contexto:** O editor hoje tem 5 tipos de nó básicos (normal, booster, brake, launcher, loop). A ideia é expandir com elementos visuais e funcionais que tornam cada pista mais única e compartilhável.

- [ ] **Fogos de artifício** — nó especial que dispara partículas coloridas ao ser atingido
- [ ] **Elementos de água** — seção "aquática" com efeito de respingo e desaceleração realista
- [ ] **Coqueiros e palmeiras** — decoração de cenário tipo "Praia" (apenas visual)
- [ ] **Objetos temáticos de montanha-russa** — arco de entrada, placas de aviso, cabine de controle
- [ ] **Skins de trilho** — alterar visual do trilho (madeira, metálico, neon)
- [ ] **Novos carrinhos** — formas diferentes além do padrão (trem, foguete, nave)
- [ ] **Skins compráveis na loja** — integrar novos carrinhos ao sistema de coins/inventory
- [ ] **Cenários alternáveis** — trocar background visual da pista (parque, vulcão, praia, espaço)
  - Comprar cenário na loja → aplica via `localStorage` antes de abrir `play.html`

**Critério de aceite:** Pelo menos 3 elementos novos de decoração funcionando no editor. Skins integradas ao sistema de loja existente.

---

### 🟢 Replay e compartilhamento avançado

- [ ] Gravar posições do carrinho a cada frame durante o run (array de {x, y, angle, t})
- [ ] Replay: reproduzir o run gravado em 1x, 2x ou câmera lenta
- [ ] Exportar replay como GIF (usar canvas + gif.js)
- [ ] Armazenar replay do melhor score em `leaderboard_entries.replay_data` (jsonb)

### 🟢 Skins e sistema de gacha

- [ ] Definir sistema de skins para o carrinho (cor, forma, rosto dos passageiros)
- [ ] Tabela `skins` com rarity (common/rare/epic/legendary)
- [ ] Gacha: gastar coins para abrir uma skin aleatória
- [ ] Aplicar skin ao carrinho no `play.html` via localStorage

### 🟢 Migração do engine para PixiJS

**Contexto:** ADR-001 decidiu Canvas 2D para MVP. V2 pode migrar para PixiJS para melhor performance com muitas partículas.

- [ ] Criar `play-v2.html` paralelo com PixiJS
- [ ] Portar física (manter mesma lógica, apenas trocar o draw)
- [ ] Benchmark: comparar FPS em pistas complexas entre Canvas e PixiJS
- [ ] Migrar quando V2 atingir paridade de features com V1

### 🟢 Mobile-first

- [ ] Detectar touch events no `play.html`
- [ ] UI adaptativa: tools panel como bottom sheet no mobile
- [ ] Joystick virtual para mover nós no touch
- [ ] Testar em iOS Safari e Android Chrome

---

## 🐛 Bugs conhecidos

### 🔴 Preview do Lovable não abre a aplicação

**Contexto:** O preview integrado do Lovable não consegue carregar a aplicação. Provavelmente relacionado à configuração do Cloudflare Workers ou ao entrypoint do Vite/TanStack Start.

- [ ] Investigar se o problema é no `wrangler.jsonc` (rota raiz `/` ou assets estáticos)
- [ ] Verificar se o `vite.config.ts` está exportando corretamente para o worker
- [ ] Testar se `npm run dev` local funciona e se o preview do Lovable aponta para o build correto
- [ ] Verificar se o redirect de `/` → `/home.html` quebra o preview (pode precisar de fallback)

**Critério de aceite:** Preview do Lovable abre e exibe a landing page ou a tela de login.

---

## Decisão: Próxima sessão

Sugestões de próximos passos baseadas no impacto:

| Opção | Impacto | Complexidade | Recomendação |
|---|---|---|---|
| 🔴 Fix preview Lovable | Bloqueante (não consegue ver o app) | Média (debug de config) | ⭐ Urgente |
| Admin: Blueprints `/admin/blueprints` | Médio (moderação) | Baixa | Em seguida |
| Admin: Usuários `/admin/users` | Médio (gestão) | Baixa | Depois |
| Admin: Dashboard `/admin` | Alto (visibilidade do jogo) | Média | Depois |

---

## Histórico de conclusões

| Data | Tarefa | Sessão |
|---|---|---|
| 2026-05-11 | Documentação viva (CLAUDE.md + docs/) | Sessão 1 |
| 2026-05-11 | Schema banco (4 tabelas + view) | Sessão 2 |
| 2026-05-11 | Save/Load/Share em play.html | Sessão 2 |
| 2026-05-11 | Submit de score ao leaderboard | Sessão 2 |
| 2026-05-11 | Câmera dinâmica no modo Testar | Sessão 3 |
| 2026-05-11 | Modal de resultado pós-corrida | Sessão 3 |
| 2026-05-11 | Ctrl+Z undo no editor | Sessão 3 |
| 2026-05-11 | Auth chip integrado | Sessão 3 |
| 2026-05-11 | Tela de Perfil `/profile` (React + Supabase) | Sessão 5 |
| 2026-05-11 | Ranking Global `/leaderboard` (top 50 + season toggle) | Sessão 6 |
| 2026-05-11 | Campanha `/campaign` (3 fases seed + painel de objetivos no play.html) | Sessão 7 |
| 2026-05-11 | Stall detection, sons Web Audio, sistema Coins/XP | Sessão 8 |
| 2026-05-11 | Nó lançador (catapulta) e navbar React global | Sessão 9 |
| 2026-05-11 | Looping 360° (nó loop) e speed trail (motion blur) | Sessão 10 |
| 2026-05-11 | Painel de Admin — infraestrutura + /admin/levels CRUD | Sessão 11 |
| 2026-05-11 | Admin completo — dashboard, /admin/blueprints, /admin/users + fix preview Lovable | Sessão 12 |
| 2026-05-11 | QA fixes — level_id em leaderboard, stars por fase na campanha, feedback offline | Sessão 13 |
