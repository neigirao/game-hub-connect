# Changelog — Crash Coaster

> Formato: [Versão] — Data
> Categorias: Adicionado, Alterado, Corrigido, Removido, Segurança
> Atualizar a cada PR mergeado na branch principal.

---

## [Não lançado] — Em desenvolvimento

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
