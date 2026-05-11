# Crash Coaster — Living Documentation

> **Para desenvolvedores e IAs:** Este arquivo é a fonte primária de verdade do projeto.
> Deve ser atualizado sempre que houver mudança arquitetural, nova feature, decisão importante ou alteração no banco.
> O Claude Code lê este arquivo automaticamente no início de cada sessão.

---

## 1. O Projeto

**Crash Coaster** é um jogo sandbox 2D de construção de montanhas-russas para web browser.

**Tagline:** *"The game where failing is more fun than winning."*

**Emoção central:** O jogador deve pensar constantemente em *"Isso é hilário."*

O entretenimento vem dos acidentes espetaculares, quase-falhas e explosões cômicas — não da perfeição. O jogo recompensa **caos controlado**, não segurança.

**Público:** Desktop-first, brasileiro, casual-gamer, conteúdo compartilhável.

---

## 2. Stack Atual

| Camada | Tecnologia | Versão |
|---|---|---|
| Meta-framework | TanStack Start | 1.167.x |
| Roteamento | TanStack Router | 1.168.x |
| UI | React | 19.2.0 |
| Estilo | Tailwind CSS | 4.2.x |
| Componentes | Shadcn / Radix UI | — |
| Renderização do jogo | HTML5 Canvas (vanilla JS) | — |
| Estado do jogo | Objeto JS global em `play.html` | — |
| Backend | Supabase (PostgreSQL + Auth + Storage) | 2.105.x |
| Auth | Google OAuth via Lovable Cloud Auth | 1.1.x |
| Hosting | Cloudflare Workers | — |
| Build | Vite | 7.3.x |

> **Pendente do GDD:** PixiJS (renderização GPU), Zustand (state management) — ainda não implementados.

---

## 3. Estrutura de Arquivos

```
/
├── public/
│   ├── play.html          # ENGINE DO JOGO — toda a lógica, física e UI do jogo (vanilla JS + Canvas)
│   └── home.html          # Landing page de marketing (HTML/CSS puro)
│
├── src/
│   ├── routes/
│   │   ├── __root.tsx     # Layout raiz: React Query provider, error boundary, 404
│   │   ├── index.tsx      # Redireciona para /home.html
│   │   └── login.tsx      # Página de login com Google OAuth
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts          # Cliente Supabase (browser, localStorage persistence)
│   │   ├── client.server.ts   # Cliente admin server-side (bypass RLS)
│   │   ├── auth-middleware.ts # Middleware Bearer token para rotas de API
│   │   └── types.ts           # Tipos gerados automaticamente (atualizar após migrations)
│   │
│   ├── components/ui/     # 40+ componentes Shadcn/Radix (não mexer sem necessidade)
│   ├── hooks/             # Custom hooks React
│   └── lib/               # Utilitários e error handling
│
├── supabase/
│   └── config.toml        # Configuração do projeto Supabase (project_id: sekuurohkxqktpllebdd)
│
├── docs/
│   ├── GDD.md             # Game Design Document condensado
│   ├── ARCHITECTURE.md    # Arquitetura técnica detalhada
│   ├── DECISIONS.md       # Log de decisões arquiteturais (ADRs)
│   └── CHANGELOG.md       # Histórico de mudanças por versão
│
├── .claude/
│   ├── settings.json      # Configurações e hooks do Claude Code
│   └── hooks/
│       └── post-commit-docs.sh  # Lembrete de atualização de docs pós-commit
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
Landing (home.html) → Login (Google OAuth) → Jogo (play.html)
```

### Engine (`public/play.html` — ~1800 linhas)

O jogo inteiro roda em um único arquivo HTML com JS vanilla e Canvas 2D.

**Estado global:**
```js
state = {
  mode: 'build' | 'test',
  nodes: [{ x, y, kind: 'normal' | 'booster' | 'brake' }],
  cart: { x, y, vx, vy, ... },
  closedLoop: boolean,
  tool: 'add' | 'move' | 'booster' | 'brake' | 'delete',
  scores: { survival, adrenaline, chaos, smoothness, creativity },
  maxSpeed, maxG, laps, nearMisses, bestScore
}
```

**Física:**
- Interpolação Catmull-Rom para curvas suaves
- G-force: `Math.hypot(ax, ay) / 9.8`
- Velocidade máxima: ~140 km/h
- 60 FPS com deltaTime normalizado

**Limites de G-force:**
- Seguro: -1G até 4.5G
- Aviso: 4.5G até 5G
- Crash: acima de 5G

**Ferramentas do editor (teclado):**
- `A` — Adicionar nó
- `M` — Mover nó
- `B` — Booster
- `F` — Freio (brake)
- `D` — Deletar
- `L` — Toggle loop fechado
- `Space` — Alternar Build/Test

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
--danger:  #FF4757   /* perigo / crash */
--safe:    #2ED573   /* seguro */
--boost:   #FFA502   /* booster / aviso */
--ghost:   #70A1FF   /* fantasmas */
--boom:    #FF7F50   /* explosões */
--candy:   #FF6BD6   /* destaque UI */
--rail:    #FFE9A8   /* trilho */
--bg-0:    #170C3D   /* fundo primário */
```

---

## 5. Banco de Dados (Supabase)

**Project ID:** `hafxruwnggitvtyngedy`
**URL:** `https://hafxruwnggitvtyngedy.supabase.co`

### Schema (migrations em `supabase/migrations/`)

| Tabela | Arquivo | Descrição |
|---|---|---|
| `profiles` | `20260511000001_create_profiles.sql` | Usuários — criado automaticamente via trigger |
| `blueprints` | `20260511000002_create_blueprints.sql` | Pistas salvas pelos usuários |
| `levels` | `20260511000003_create_levels.sql` | Fases da campanha (gerenciadas pelo admin) |
| `leaderboard_entries` | `20260511000004_create_leaderboard.sql` | Ranking global e mensal |

**View:** `leaderboard_with_profiles` — top scores com rank e username

**Trigger:** `on_auth_user_created` — cria `profiles` automaticamente ao registrar usuário

> Migrations já aplicadas ao projeto `hafxruwnggitvtyngedy` via MCP.
> Para regenerar types: `npx supabase gen types typescript --project-id hafxruwnggitvtyngedy > src/integrations/supabase/types.ts`

### Como play.html acessa o Supabase

O `client.ts` grava `cc_sb_url` e `cc_sb_key` no `localStorage` após inicializar.
O `play.html` lê essas chaves e inicializa o `@supabase/supabase-js` via CDN (ESM).
A sessão OAuth já fica no localStorage do mesmo domínio — zero friction.

---

## 6. Autenticação

- Provider: Google OAuth
- Biblioteca: `@lovable.dev/cloud-auth-js`
- Fluxo: `/login` → OAuth Google → redirect para `/home.html`
- Server-side: `auth-middleware.ts` valida Bearer token nas rotas de API
- Client-side: `client.ts` persiste sessão no localStorage

---

## 7. O que Está Implementado vs. Pendente

### Implementado
- [x] Engine do jogo (física, trilhos, colisões, score)
- [x] Editor de pistas com snapping e splines
- [x] Sistema de G-force e crash detection
- [x] Partículas, explosões, ghosts (rastros)
- [x] UI completa do jogo (topbar, HUD, painel de score)
- [x] Landing page
- [x] Login com Google OAuth
- [x] Infraestrutura Supabase conectada
- [x] Schema do banco (profiles, blueprints, levels, leaderboard_entries)
- [x] Tipos TypeScript gerados para todas as tabelas
- [x] Salvar pistas no banco via modal em play.html
- [x] Carregar pistas salvas (lista com load/delete)
- [x] Compartilhar pista via URL (track data codificado em base64)
- [x] Submit automático de score ao leaderboard após corrida
- [x] Documentação viva (CLAUDE.md, docs/)
- [x] Câmera dinâmica que segue o carrinho no modo Testar (zoom 1.3x + lerp)
- [x] Modal de resultado pós-corrida (score animado, estrelas, share, play again)
- [x] Undo / Ctrl+Z no editor de pistas (stack de 60 snapshots)
- [x] Auth chip (Google login) integrado ao bloco principal do Supabase
- [x] Tela de Perfil `/profile` (React + auth guard + XP bar + blueprints + histórico de scores)
- [x] Ranking Global `/leaderboard` (top 50, season toggle, highlight do usuário atual)
- [x] Campanha `/campaign` (grid de fases, 3 fases seed, painel de objetivos no play.html via `?level=`)
- [x] Stall detection (parado >3s encerra corrida), velocidade reversa limitada
- [x] Sons Web Audio API — rail hum, boost burst, crash noise (síntese, zero assets externos)
- [x] Sistema de Coins/XP — função `award_run_rewards` no Supabase, chamada após cada corrida

### Pendente (MVP restante)
- [ ] Sistema de campanha com fases
- [ ] Perfil: animação de ganho de XP/coins ao receber recompensas
- [ ] Geração de GIF/replay
- [ ] Som e música

### Pendente (pós-MVP / V2+)
- [ ] Migrar engine para PixiJS
- [ ] Zustand para state management
- [ ] Skins e sistema de gacha
- [ ] Mobile-first
- [ ] Creator economy / marketplace
- [ ] Temporadas e eventos

---

## 8. Princípios de Desenvolvimento

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
- `play.html` é o coração do jogo — mudanças aqui têm alto impacto
- Não introduzir breaking changes na física sem testar o score system
- Sempre atualizar `src/integrations/supabase/types.ts` após migrations
- Commits devem ser descritivos (o histórico atual está genérico — evitar "Changes")

### Performance
- Target: 60 FPS em notebooks modestos e browsers modernos
- Futuramente: Web Workers para física, object pooling para partículas

---

## 9. Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Lint + format
npm run lint
npm run format

# Gerar tipos Supabase (após migrations)
npx supabase gen types typescript --project-id sekuurohkxqktpllebdd > src/integrations/supabase/types.ts

# Deploy (Cloudflare Workers)
npx wrangler deploy
```

---

## 10. Roadmap e Tarefas

O backlog detalhado com critérios de aceite e dependências está em **`docs/ROADMAP.md`**.

**Próximos passos recomendados (MVP):**
1. ~~Tela de Perfil (`/profile`)~~ ✅
2. ~~Ranking Global (`/leaderboard`)~~ ✅
3. Campanha (`/campaign`) — grid de fases + integração `play.html?level=`
4. Física melhorada — stall detection, novo nó lançador, sons via Web Audio API

| Fase | Foco |
|---|---|
| **MVP** | Campanha, física melhorada, navegação React |
| **V2** | Replay/GIF, skins + gacha, PixiJS, temporadas |
| **V3** | Creator economy, marketplace, mobile-first, desafios especiais |

---

## 11. Contatos e Acessos

| Papel | Detalhe |
|---|---|
| Admin principal | `neigirao@gmail.com` |
| Supabase project | `hafxruwnggitvtyngedy` |
| Repositório | `neigirao/game-hub-connect` |
| Branch de desenvolvimento | `claude/understand-application-WSjdS` |

---

## Como Atualizar Este Arquivo

**Atualizar o CLAUDE.md sempre que:**
- Uma nova tabela for criada no banco
- Uma feature for implementada ou removida
- A stack tecnológica mudar (nova lib, remoção de lib)
- Uma decisão arquitetural importante for tomada
- O roadmap mudar

**Atualizar `docs/CHANGELOG.md` a cada PR mergeado.**
**Registrar decisões importantes em `docs/DECISIONS.md`.**
