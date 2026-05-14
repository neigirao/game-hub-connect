# Changelog — Crash Coaster

> Formato: [Versão] — Data
> Categorias: Adicionado, Alterado, Corrigido, Removido, Segurança
> Atualizar a cada PR mergeado na branch principal.

---

## [Não lançado] — Em desenvolvimento

### Sessão 14 — 2026-05-14: Correções no editor/Test mode e landing

**Objetivo da sessão:** Desbloquear o modo Testar logo no primeiro acesso, corrigir erros de console e restaurar a landing `home.html` na rota `/`.

#### Corrigido — `public/play.html`
- **`SyntaxError: Identifier 'showToast' has already been declared`** — duas declarações de `showToast` foram unificadas em uma única função `showToast(text, opt?)`, onde `opt` aceita string (cor), boolean (modo erro) ou `false` (sucesso). Renderiza em `#toast` com timeout de 2000ms. Removida a versão antiga "modal" (`#globalToast`).
- **Carrinho parado ao apertar "Testar"** — `startTest()` agora valida o retorno de `initCart()`: se `null` (nós insuficientes), exibe toast "Construa pelo menos 2 nós para testar 🛤️", reverte `state.mode` para `'build'`, remove a classe `mode-test` e devolve o foco ao botão de Construir.
- **404 `favicon.ico`** — adicionado `<link rel="icon">` inline (data URI SVG com gradiente azul + 🎢) no `<head>` para eliminar a request 404.
- **Mini-rampa padrão em `initDefaultTrack()`** — alterado de 1 nó (apenas estação de partida) para 3 nós (alto 0.20/0.35 → meio 0.50/0.55 → baixo 0.80/0.65). Test mode agora funciona imediatamente em sessões novas, sem precisar carregar pista do banco.

#### Adicionado — Landing pública na rota `/`
- `src/routes/index.tsx` agora decide pelo estado da sessão Supabase: anônimo → `window.location.replace('/home.html')`; autenticado → `navigate({ to: '/campaign' })`. Resolve o problema de a home não aparecer mais no preview após a navbar React global ter sido introduzida na sessão 9.
- Tela de loading minimalista com paleta do jogo durante o `getSession()`.

#### Notas
- O aviso `"A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"` é ruído de extensão MV3 do Chrome — não é bug do app.

---

### Sessão 13 — 2026-05-13: Rotas sociais, loja e desafio diário

**Objetivo da sessão:** Consolidar recursos sociais/economia no app React e preparar base SQL do desafio diário.

#### Adicionado — Novas rotas de produto (React)
- `/tracks` com listagem de pistas públicas, ordenação (destaque/likes/score/recente) e like em tempo real via RPC `toggle_blueprint_like`
- `/shop` com catálogo de badges/skins/cenários, compra e equip de cosméticos
- `/challenge` com "Desafio do Dia", contagem regressiva até meia-noite e ranking diário (`season = daily-YYYY-MM-DD`)
- `/share` para fluxo dedicado de compartilhamento

#### Adicionado — Migrações Supabase
- `20260512000002_daily_picks.sql`: estrutura para curadoria diária de pistas
- `20260513144056_10c92338-a77a-41e3-af4c-5cbe68dd13f0.sql`: ajustes de schema para sustentar os fluxos mais recentes

### Sessão 10 — 2026-05-11: Looping 360° e speed trail (motion blur)

**Objetivo da sessão:** Adicionar o nó de looping 360° ao editor e efeito de rastro de velocidade (motion blur) ao carrinho.

#### Adicionado — Nó de looping 360° (`play.html`)
- Novo tipo de nó `kind: 'loop'` (rosa `#FF6BD6`) com ícone de seta circular
- Atalho de teclado `G` ativa ferramenta de looping no editor; botão "360°" na toolbar
- **Física:** ao passar sobre o nó com ≥50 km/h, inicia arco circular de 100px de raio
- Padrão `do...while(false)` com `break` permite saída precoce da física on-track durante o loop
- Gravidade real aplicada ao longo do arco: `dv/dt = -D * 900 * cos(θ) * dt`
- G-force exibida dinamicamente durante o loop (centripetal + gravidade)
- Conclusão ao percorrer 90% do círculo: +20 adrenaline, confetti, toast "LOOPING PERFEITO!"
- Se velocidade insuficiente: toast de aviso sem crash
- Sparks rosas contínuos durante a revolução

#### Adicionado — Speed trail (motion blur, `play.html`)
- 4 cópias semi-transparentes do carrinho desenhadas atrás na direção de movimento
- Ativo acima de 70 km/h; opacidade máxima de 35% em velocidade máxima
- Cor rosa abaixo de 110 km/h; amarelo dourado (cor do trilho) acima (ultra-velocidade)
- Funciona tanto no modo on-track quanto no modo voando (launcher)

---

### Sessão 9 — 2026-05-11: Nó lançador (catapulta) e navbar React global

**Objetivo da sessão:** Adicionar o nó de catapulta ao editor de pistas e criar uma navbar React global compartilhada por todas as rotas.

#### Adicionado — Nó lançador (`play.html`)
- Novo tipo de nó `kind: 'launcher'` (verde `#2ED573`) com ícone de seta para cima
- Atalho de teclado `N` ativa ferramenta de lançador no editor
- Botão "CATAP" adicionado à toolbar entre freio e deletar
- **Física:** ao passar sobre o nó, `c.flying = true`, velocidade vertical `c.vy = -700`, velocidade horizontal amplificada em 1.2× (mín 350 px/s)
- Flag `_launchCool` previne re-disparo enquanto o carrinho permanece sobre o nó; resetada ao sair
- Efeito visual: faíscas verdes + confetti ao ser catapultado
- Toast "🚀 CATAPULTADO!" + som de boost ao disparar

#### Adicionado — Navbar React global (`src/components/game-nav.tsx`)
- Componente `GameNav` com sticky positioning (z-index 100), paleta do jogo
- Links: 🎢 Jogar, 🗺️ Campanha, 🏆 Ranking, 👤 Perfil — link ativo destacado em rosa
- Avatar do usuário logado (Google img ou iniciais sobre gradiente) + primeiro nome
- Botão "Entrar" para usuários não autenticados
- Oculta automaticamente nas rotas `/` e `/login` via `useRouterState`
- Escuta `onAuthStateChange` para atualizar em tempo real

#### Alterado — Layout raiz (`src/routes/__root.tsx`)
- `GameNav` adicionado ao `RootComponent` antes do `<Outlet />`
- Navbars duplicadas removidas de `profile.tsx`, `leaderboard.tsx` e `campaign.tsx`

---

### Sessão 5 — 2026-05-11: Tela de Perfil do Usuário

**Objetivo da sessão:** Criar a tela de perfil React conectada ao Supabase, mostrando dados reais do jogador.

#### Adicionado — Rota `/profile` (`src/routes/profile.tsx`)
- Layout completo com navbar, hero (avatar + level + XP bar), stat badges, lista de pistas salvas e histórico de corridas
- **Avatar:** imagem do Google se disponível; fallback com iniciais sobre gradiente
- **XPBar:** barra animada com `xp % 500 / 500` de preenchimento e label de XP restante para próximo level
- **StatBadge:** componente reutilizável para coins, XP total, melhor score e contagem de pistas
- **BlueprintRow:** linha com nome, contagem de nós, tipo de loop, data e botão "Jogar"
- **ScoreRow:** linha com score total, breakdowns coloridos (S/A/C), velocidade máxima, G máximo e estrelas calculadas
- **LoadingCard:** skeleton de loading com animação pulse enquanto queries executam
- **Auth guard:** redireciona para `/login` se nenhuma sessão ativa for encontrada
- **Queries paralelas:** `profiles`, `blueprints` (últimas 5) e `leaderboard_entries` (últimas 5) com `Promise.all`
- **Visual:** paleta do jogo (`#0a0420`, `#2e1870`, `#4a2aa6`, gradientes candy) + fontes Fredoka + JetBrains Mono via Google Fonts

#### Alterado — `src/routeTree.gen.ts`
- Adicionada rota `/profile` ao file route tree do TanStack Router (import, update, augmentation de módulo, `rootRouteChildren`)

---

### Sessão 8 — 2026-05-11: Física melhorada, sons e sistema de Coins/XP

**Objetivo da sessão:** Polish do jogo — stall detection, sons sintetizados e recompensas reais de XP/coins após cada corrida.

#### Adicionado — Stall detection (`play.html`)
- Acúmulo de `c.stallTime` quando `|v| < 5` e pista plana (`|slope| < 0.05`)
- Após 3s parado: toast de aviso, status "PARADO! 😴", penalidade de -30 survival e encerra a corrida 1.5s depois
- Velocidade reversa máxima limitada de -200 para -80 px/s (evita pista andando para trás indefinidamente)

#### Adicionado — Sons via Web Audio API (`play.html`)
- Zero dependências externas — gerados por síntese em tempo real
- **Rail hum** (`updateRailSound`): oscilador sawtooth contínuo, frequência proporcional à velocidade (40–220 Hz), volume máximo 0.12 para não sobrepor o gameplay
- **Boost burst** (`playBoostSound`): oscilador square 520→980 Hz em 0.12s, throttle de 200ms para não travar em boosters longos
- **Crash noise** (`playCrashSound`): buffer de ruído branco filtrado com lowpass 1200→80 Hz e envelope de decaimento de 0.8s
- Sons param automaticamente ao voltar ao modo Build, no stall e no completeRun
- `AudioContext` inicializado no primeiro uso (política de autoplay dos browsers)

#### Adicionado — Sistema de Coins/XP (`play.html` + Supabase)
- Migration `create_award_run_rewards`: função PL/pgSQL `award_run_rewards(p_user_id, p_stars, p_crashed)`
  - Crash: +10 XP, +5 coins · Completo: +50 XP + 30 XP/estrela, +100 coins/estrela
  - Atualiza `profiles.xp`, `coins` e recalcula `level` (1 level = 500 XP) atomicamente
  - Retorna `{xp_gained, coins_gained, new_xp, new_coins, new_level}` como jsonb
- `awardRewards(crashed)` no play.html: chama `sbClient.rpc('award_run_rewards', ...)` após cada corrida
- Toast "**+XP  🪙 +coins**" visível ao jogador assim que a função retorna

---

### Sessão 7 — 2026-05-11: Tela de Campanha (/campaign)

**Objetivo da sessão:** Criar a tela de seleção de fases, seed com 3 níveis e integração com play.html via `?level=`.

#### Adicionado — Rota `/campaign` (`src/routes/campaign.tsx`)
- Grid responsivo de cards de fase com banner colorido por cenário (parque/montanha/vulcão)
- **MiniTrack:** preview SVG da pista starter gerado a partir dos nós do `starter_track`
- **LevelCard:** emoji de cenário, badge de dificuldade, título, descrição, lista de objetivos, thresholds de estrelas (⭐⭐⭐), recompensas (coins + XP) e botão "Jogar"
- **StarBar:** estrelas com glow baseadas no melhor score do jogador vs. thresholds
- Botão "Jogar" redireciona para `/play.html?level={id}`
- Estado vazio com card "Fases em construção"
- CTA de login para usuários não autenticados

#### Adicionado — Seed de 3 fases (`migration: seed_starter_levels`)
- **Fase 1 — Primeira Descida** (Fácil, cenário `parque`): 7 nós, objetivos de sobrevivência e 60km/h, recompensa 50🪙 +100XP
- **Fase 2 — Loopings e Boosters** (Médio, cenário `montanha`): 8 nós com boosters, objetivos de 100km/h e G-force, recompensa 100🪙 +200XP
- **Fase 3 — Caos Total** (Difícil, cenário `vulcao`): 9 nós com boosters e freio, objetivos de 120km/h e quase-mortes, recompensa 200🪙 +400XP

#### Adicionado — Suporte a `?level=` no `play.html`
- `loadLevelFromUrl()` async: busca o nível via Supabase REST API (sem dependência do init do cliente JS)
- Carrega `starter_track` no estado e chama `pushHistory()` para registrar no undo stack
- Painel `#levelPanel` fixo à esquerda com: link "← Campanha", título da fase, lista de objetivos e thresholds de estrelas
- CSS do painel com backdrop-filter, animação slideIn e tema da paleta do jogo

#### Alterado — `src/routeTree.gen.ts`
- Adicionada rota `/campaign` ao file route tree

---

### Sessão 6 — 2026-05-11: Ranking Global (/leaderboard)

**Objetivo da sessão:** Criar a tela de ranking usando a view `leaderboard_with_profiles` já disponível no banco.

#### Adicionado — Rota `/leaderboard` (`src/routes/leaderboard.tsx`)
- Tabela com top 50 corridas, ordenadas por `rank` da view `leaderboard_with_profiles`
- **RankBadge:** medals 🥇🥈🥉 para top 3; `#N` para demais
- **LeaderboardRow:** avatar com iniciais, username, breakdowns coloridos (S/A/C), velocidade e G máximos, estrelas calculadas
- **Highlight do usuário atual:** borda rosa + fundo gradiente + label "(você)"
- **SeasonToggle:** botões Global vs. mês atual (`YYYY-MM`); troca a query ao clicar
- **Callout de posição:** se o usuário logado estiver fora do top 50, exibe sua posição abaixo do header
- **Estado vazio:** card com CTA de jogar quando não há corridas
- **Loading skeleton:** 8 linhas com animação pulse + slide-in animado ao carregar
- Queries sem auth guard — ranking é público

#### Alterado — `src/routeTree.gen.ts`
- Adicionada rota `/leaderboard` ao file route tree

---

### Sessão 2 — 2026-05-11: Infraestrutura de banco e integração do jogo

**Objetivo da sessão:** Evoluir do MVP isolado (play.html sem backend) para uma aplicação conectada ao Supabase, com persistência real de pistas, ranking e compartilhamento.

#### Adicionado — Sistema de documentação viva (ADR-010)
- `CLAUDE.md` — fonte primária de verdade do projeto, lida automaticamente pelo Claude Code a cada sessão; contém stack, estrutura de arquivos, estado atual (implementado vs. pendente), decisões e acessos
- `docs/GDD.md` — Game Design Document condensado (conceito, pilares, física, score, progressão, monetização)
- `docs/ARCHITECTURE.md` — arquitetura técnica com diagrama ASCII browser → Cloudflare → Supabase
- `docs/DECISIONS.md` — log de decisões arquiteturais com contexto, alternativas e consequências (ADRs 001–010)
- `docs/CHANGELOG.md` — este arquivo, com histórico versionado por sessão
- `.claude/settings.json` — permissões e hooks do Claude Code
- `.claude/hooks/post-commit-docs.sh` — script pós-commit que detecta quais arquivos mudaram e exibe lembretes contextuais específicos (CHANGELOG, ARCHITECTURE ou CLAUDE.md)

#### Adicionado — Schema do banco de dados (projeto `hafxruwnggitvtyngedy`, sa-east-1)
- `supabase/migrations/20260511000001_create_profiles.sql` — estende tabela existente com colunas CC (`username`, `coins`, `inventory`, `is_admin`, `updated_at`); mantém colunas legadas (`full_name`, `points`, etc.) via `ADD COLUMN IF NOT EXISTS`
- `supabase/migrations/20260511000002_create_blueprints.sql` — pistas salvas pelos usuários; RLS completo (ver público, CRUD próprio); índices para queries de ranking
- `supabase/migrations/20260511000003_create_levels.sql` — fases da campanha gerenciadas por admin; políticas separadas para admin vs. jogador
- `supabase/migrations/20260511000004_create_leaderboard.sql` — ranking com `leaderboard_entries` + view `leaderboard_with_profiles` com `rank()` window function por temporada
- Todas as migrations aplicadas via MCP ao projeto `hafxruwnggitvtyngedy`
- `supabase/config.toml` corrigido para o project_id real (era `sekuurohkxqktpllebdd`, placeholder)
- `src/integrations/supabase/types.ts` — tipos TypeScript completos para todas as tabelas e views

#### Adicionado — Bridge Supabase para play.html (ADR-007)
- `src/integrations/supabase/client.ts` — grava `cc_sb_url` e `cc_sb_key` no localStorage após inicializar, tornando as credenciais acessíveis ao `play.html` sem duplicação e sem hardcode
- `play.html` — inicializa `@supabase/supabase-js@2` via CDN ESM; reutiliza sessão OAuth do React app automaticamente (mesmo domínio, mesmo localStorage)

#### Adicionado — Save / Load / Share em play.html
- Botão **Salvar** — abre modal com campo de nome e lista de pistas do usuário
- Botão **Pistas** — abre a mesma modal diretamente na lista de pistas salvas
- **Carregar pista** da lista com um clique (substitui trilha atual no editor)
- **Deletar pista** com confirmação antes de remover do banco
- Botão **Compartilhar** — codifica nós em `btoa(JSON.stringify({nodes, loop}))` e copia URL para clipboard; link funciona sem login (ADR-008)
- **Submit automático de score** ao `leaderboard_entries` ao completar corrida (survival > 0)
- Toast global de feedback para todas as operações (salvo, erro, copiado)

### Sessão 4 — 2026-05-11: PR, roadmap e tarefas

**Objetivo:** Consolidar o trabalho das sessões 1-3 em PR, criar backlog estruturado de tarefas.

#### Adicionado
- `docs/ROADMAP.md` — backlog priorizado por fase (MVP → V2 → V3) com critérios de aceite, dependências e recomendação de próximo passo para cada dev/IA que abrir o projeto
- PR #2 criado: `feat: banco de dados, save/load/share, câmera, modal de resultado e undo`
- `CLAUDE.md` seção 10 atualizada com referência ao ROADMAP e próximos passos recomendados

---

### Sessão 3 — 2026-05-11: Melhorias no jogo (play.html)

**Objetivo da sessão:** Tornar o jogo mais cinematográfico, responsivo e polish — câmera que acompanha o carrinho, feedback de fim de corrida e undo no editor.

#### Corrigido — Bug crítico
- Removido segundo bloco `<script>` com URL Supabase obsoleta (`sekuurohkxqktpllebdd`) que chamava `game_progress` e RPC `record_run` inexistentes, gerando erros silenciosos a cada corrida

#### Adicionado — Câmera dinâmica (test mode)
- No modo Testar, a câmera faz zoom em 1.3x e segue o carrinho suavemente com interpolação (lerp 9%)
- Ao voltar ao modo Construir, a câmera recua suavemente para visão geral
- Background desenhado em screen-space (não scroll) para manter referência visual; objetos do mundo em world-space com transform de câmera

#### Adicionado — Modal de resultado pós-corrida
- Após cada corrida (sucesso ou crash), aparece modal com: emoji contextual, título animado, score total com count-up animado, barras de categoria preenchendo com transição CSS, 3 estrelas acendendo em sequência
- Título e emoji variam: 🏆 (score > 75), 🎢 (score > 40), 😬 (score baixo), 💥 (crash)
- Botões: Compartilhar (copia URL), Editar Pista (volta ao build), Jogar de Novo (reinicia test)
- Crash espetacular (L9 com impacto no chão) abre o modal após 1.8s de drama

#### Adicionado — Ctrl+Z / Undo no editor
- Stack de histórico de até 60 snapshots de nós + estado de loop
- Push automático após: adicionar nó, soltar drag, deletar nó, mudar tipo (booster/freio), toggle de loop
- Ctrl+Z (ou Cmd+Z no Mac) desfaz a última operação com toast de confirmação
- Undo desabilitado no modo Testar (não interfere na física)

#### Adicionado — Auth chip integrado
- Chip de login com Google (top-right) migrado para o bloco principal do Supabase bridge
- Exibe avatar + nome do usuário logado; clique abre signOut
- Não logado: exibe botão "Entrar com Google" com ícone oficial

---

### Sessão 1 — 2026-05-11: MVP inicial (pré-documentação)

---

---

## [0.1.0] — MVP Inicial (2026-05-11)

**Objetivo:** Criar o protótipo jogável e conectar a infraestrutura base (auth, hosting, banco).

### Adicionado
- Engine do jogo em `public/play.html` (~1800 linhas, Canvas 2D + vanilla JS)
  - Editor de pistas com nós e interpolação Catmull-Rom
  - Tipos de nó: normal, booster, freio
  - Física: gravidade, velocidade, G-force, fricção, detecção de crash
  - Sistema de score: Survival, Adrenaline, Chaos, Smoothness, Creativity
  - Sistema de estrelas (0–3)
  - Ghosts (rastros de corridas anteriores)
  - Partículas, explosões, shake de câmera
  - Ferramentas de editor com atalhos de teclado (A/M/B/F/D/L/Space)
  - HUD com telemetria (velocidade, G-force em tempo real)
  - Modo Build / Test
- Landing page em `public/home.html`
- App React com TanStack Start + Cloudflare Workers
- Login com Google OAuth (Lovable Cloud Auth + Supabase)
- Infraestrutura Supabase conectada (sem tabelas ainda)
- Roteamento com TanStack Router (`/`, `/login`, `/__root`)
- 40+ componentes Shadcn/Radix UI disponíveis

### Stack
- React 19.2.0, TanStack Start 1.167.x, TanStack Router 1.168.x
- Tailwind CSS 4.2.x, Vite 7.3.x
- Supabase 2.105.x, Cloudflare Workers

---

## Como Atualizar Este Arquivo

Ao mergear um PR, adicione uma entrada na seção `[Não lançado]` com:
- O que foi adicionado/alterado/corrigido
- Impacto em gameplay ou arquitetura (se houver)

Ao fazer um release, mova o conteúdo de `[Não lançado]` para uma nova versão numerada `[X.Y.Z] — YYYY-MM-DD`.
