# Changelog — Crash Coaster

> Formato: [Versão] — Data
> Categorias: Adicionado, Alterado, Corrigido, Removido, Segurança
> Atualizar a cada PR mergeado na branch principal.

---

## [Não lançado] — Em desenvolvimento

### Adicionado — Documentação viva
- `CLAUDE.md` — documentação viva principal (lida automaticamente pelo Claude Code)
- `docs/GDD.md` — Game Design Document condensado para consulta rápida
- `docs/ARCHITECTURE.md` — arquitetura técnica detalhada com diagramas
- `docs/DECISIONS.md` — log de decisões arquiteturais (ADRs 001–006)
- `docs/CHANGELOG.md` — este arquivo
- `.claude/settings.json` — configuração de hooks do Claude Code
- `.claude/hooks/post-commit-docs.sh` — lembrete automático de atualização de docs pós-commit

### Adicionado — Schema do banco de dados
- `supabase/migrations/20260511000001_create_profiles.sql` — tabela de perfis com trigger automático de criação
- `supabase/migrations/20260511000002_create_blueprints.sql` — tabela de pistas com RLS e índices
- `supabase/migrations/20260511000003_create_levels.sql` — tabela de fases da campanha
- `supabase/migrations/20260511000004_create_leaderboard.sql` — ranking global com view `leaderboard_with_profiles`
- `src/integrations/supabase/types.ts` — tipos TypeScript completos para todas as tabelas

### Adicionado — Save / Load / Share em play.html
- Botão "Salvar" abre modal com campo de nome + lista de pistas salvas
- Botão "Pistas" abre a mesma modal com pistas do usuário logado
- Carregar pista da lista (substitui a pista atual no editor)
- Deletar pista da lista (com confirmação)
- Botão "Compartilhar" gera URL com track data em base64 — carregada automaticamente ao abrir o link
- Submit automático de score ao `leaderboard_entries` após completar corrida
- `client.ts` grava `cc_sb_url` e `cc_sb_key` no localStorage para uso pelo `play.html`
- `play.html` inicializa Supabase JS via CDN (ESM) e reutiliza sessão OAuth do React app

---

## [0.1.0] — MVP Inicial (2026-05-11)

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
