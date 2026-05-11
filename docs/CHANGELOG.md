# Changelog — Crash Coaster

> Formato: [Versão] — Data
> Categorias: Adicionado, Alterado, Corrigido, Removido, Segurança
> Atualizar a cada PR mergeado na branch principal.

---

## [Não lançado] — Em desenvolvimento

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
