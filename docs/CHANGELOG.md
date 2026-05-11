# Changelog — Crash Coaster

> Formato: [Versão] — Data
> Categorias: Adicionado, Alterado, Corrigido, Removido, Segurança
> Atualizar a cada PR mergeado na branch principal.

---

## [Não lançado] — Em desenvolvimento

### Adicionado
- `CLAUDE.md` — documentação viva principal (lida automaticamente pelo Claude Code)
- `docs/GDD.md` — Game Design Document condensado para consulta rápida
- `docs/ARCHITECTURE.md` — arquitetura técnica detalhada
- `docs/DECISIONS.md` — log de decisões arquiteturais (ADRs)
- `docs/CHANGELOG.md` — este arquivo
- `.claude/settings.json` — configuração de hooks do Claude Code
- `.claude/hooks/post-commit-docs.sh` — lembrete automático de atualização de docs pós-commit

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
