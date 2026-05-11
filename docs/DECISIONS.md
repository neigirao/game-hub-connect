# Decisões Arquiteturais — Crash Coaster

> Este arquivo registra decisões importantes de arquitetura e produto.
> Formato: contexto → opções consideradas → decisão → consequências.
> Adicione uma entrada sempre que uma decisão significativa for tomada.

---

## ADR-001 — Engine de renderização: Canvas 2D no MVP

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
O GDD recomenda PixiJS (WebGL, GPU-accelerated) para melhor performance com partículas e sprites em massa. Porém, estamos no MVP.

**Opções consideradas:**
1. Canvas 2D nativo (vanilla JS)
2. PixiJS (WebGL)
3. Three.js (3D, overkill para 2D)
4. Phaser (game engine completa)

**Decisão:**
Canvas 2D no MVP, com plano de migrar para PixiJS na V2.

**Motivo:**
- Canvas 2D é suficiente para validar o game loop e a física
- Zero dependências externas no `play.html`
- Mais rápido para iterar no MVP
- PixiJS adiciona complexidade antes de validar product-market fit

**Consequências:**
- Performance limitada com muitas partículas simultâneas
- Migração para PixiJS na V2 será um refactor significativo de `play.html`
- Aceito porque o core loop do jogo funciona bem com Canvas

---

## ADR-002 — State management: objeto global no MVP

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
O GDD recomenda Zustand. O jogo em `play.html` usa um objeto JS global mutável.

**Opções consideradas:**
1. Objeto global JS (atual)
2. Zustand
3. Redux Toolkit
4. Jotai

**Decisão:**
Objeto global no MVP, Zustand na integração com React.

**Motivo:**
- `play.html` é vanilla JS — Zustand é uma lib React
- Para o MVP, o estado do jogo não precisa ser reativo ou persistido
- Zustand fará sentido quando integrarmos o jogo com o React App (salvar/carregar pistas, sincronizar perfil)

**Consequências:**
- Estado do jogo não persiste entre sessões (perda ao fechar a aba)
- Sem devtools de estado para debugging
- Refactor necessário ao integrar com banco e React

---

## ADR-003 — Arquitetura híbrida: React + HTML standalone

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
O jogo (`play.html`) e o shell da aplicação (TanStack Start/React) são completamente separados.

**Opções consideradas:**
1. Jogo inteiro em React + Canvas dentro de componente
2. Jogo em HTML standalone (atual)
3. Jogo em iframe dentro do React

**Decisão:**
Manter HTML standalone por enquanto, integrar ao React quando houver necessidade de banco/auth dentro do jogo.

**Motivo:**
- O jogo foi iniciado como protótipo standalone
- Integrar ao React agora quebraria o ritmo de desenvolvimento
- A integração real (salvar pistas, autenticar, ranking) ainda não está implementada

**Consequências:**
- Auth e estado de usuário não chegam ao `play.html` ainda
- Quando integrar, será necessário passar JWT e dados de usuário via URL params ou postMessage
- Planejar essa integração antes de implementar o banco

---

## ADR-004 — Hosting: Cloudflare Workers

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
Necessidade de hosting com edge computing para latência global.

**Opções consideradas:**
1. Cloudflare Workers (atual)
2. Railway
3. Vercel
4. Fly.io

**Decisão:**
Cloudflare Workers via TanStack Start.

**Motivo:**
- Edge runtime global (menor latência para jogadores brasileiros e internacionais)
- Integração nativa com Cloudflare CDN
- TanStack Start já tem plugin para Cloudflare
- Custo baixo no plano gratuito

**Consequências:**
- Ambiente de execução limitado (sem Node.js APIs nativas)
- Cold starts podem acontecer
- Compatibilidade date `2025-09-24` deve ser mantida no `wrangler.jsonc`

---

## ADR-005 — Autenticação: Google OAuth via Lovable Cloud Auth

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
Necessidade de autenticação para salvar pistas e ranking.

**Opções consideradas:**
1. Supabase Auth nativo (email/senha + OAuth)
2. Lovable Cloud Auth + Supabase (atual)
3. Auth0
4. Clerk

**Decisão:**
Lovable Cloud Auth com Google OAuth como único provider inicial.

**Motivo:**
- Simplicidade — um único método de login reduz fricção
- Google é o provider com maior cobertura para o público-alvo
- Lovable Cloud Auth já estava integrado no template base

**Consequências:**
- Usuários sem Google não conseguem fazer login
- Se precisar adicionar email/senha, refatorar para usar Supabase Auth diretamente
- Dependência de lib da Lovable (`@lovable.dev/cloud-auth-js`)

---

## ADR-006 — play.html como arquivo único

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
O jogo inteiro em ~1800 linhas de um único arquivo HTML.

**Opções consideradas:**
1. Arquivo único (atual)
2. Modularizar em JS separado
3. Reescrever como componente React

**Decisão:**
Manter arquivo único no MVP.

**Motivo:**
- Mais fácil de distribuir e testar
- Sem processo de build para o jogo
- Facilita prototipagem rápida de física e UI

**Consequências:**
- Difícil de manter conforme o arquivo cresce
- Sem TypeScript, sem linting
- Plano para V2: modularizar em módulos ES ou migrar para componente React com Canvas

---

## Template para novas decisões

```markdown
## ADR-XXX — Título da decisão

**Data:** YYYY-MM-DD
**Status:** Proposto | Aceito | Depreciado | Substituído por ADR-YYY

**Contexto:**
O que motivou esta decisão? Qual problema precisa ser resolvido?

**Opções consideradas:**
1. Opção A
2. Opção B (escolhida)
3. Opção C

**Decisão:**
O que foi decidido e por quê.

**Motivo:**
Justificativas específicas para a escolha.

**Consequências:**
O que muda? Quais trade-offs foram aceitos? O que precisa ser feito depois?
```
