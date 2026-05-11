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

## ADR-007 — Bridge play.html ↔ Supabase via localStorage

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
`play.html` é vanilla JS sem acesso ao build do Vite, portanto não consegue ler variáveis de ambiente `VITE_*` em tempo de execução. Precisávamos que ele acessasse o Supabase sem duplicar credenciais.

**Opções consideradas:**
1. Hardcodar URL e chave no `play.html`
2. Passar via URL params (`?sb_url=...&sb_key=...`)
3. `client.ts` grava no localStorage → `play.html` lê (atual)
4. Proxy via Cloudflare Worker que injeta as credenciais

**Decisão:**
`client.ts` grava `cc_sb_url` e `cc_sb_key` no localStorage após inicializar. `play.html` lê essas chaves e inicializa o `@supabase/supabase-js` via CDN ESM.

**Motivo:**
- Sem duplicação: as credenciais ficam em apenas um lugar (env vars do build)
- localStorage é compartilhado entre páginas do mesmo domínio
- Sessão OAuth do React app reutilizada automaticamente pelo play.html
- Zero configuração extra para o usuário

**Consequências:**
- `client.ts` deve ser carregado antes de `play.html` (fluxo normal da app)
- Se o usuário abrir `play.html` diretamente sem passar pela app React, `cc_sb_url` não estará no localStorage e o Supabase não inicializará
- Solução futura: mover o jogo para dentro do React (ADR-003)

---

## ADR-008 — Compartilhamento de pistas via URL com base64

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
Precisávamos permitir que usuários compartilhassem pistas sem necessariamente estar logados, e sem que o destinatário precisasse ter conta.

**Opções consideradas:**
1. Salvar no banco e compartilhar UUID da pista
2. Codificar o JSON dos nós em base64 na URL (atual)
3. Gerar link encurtado via serviço externo

**Decisão:**
`btoa(JSON.stringify({nodes, loop}))` no parâmetro `?track=` da URL.

**Motivo:**
- Zero backend: qualquer pessoa com o link abre a pista imediatamente
- Funciona sem login
- Pistas pequenas (< 30 nós) ficam dentro do limite seguro de URL (~2000 chars)
- Compartilhável via qualquer canal (WhatsApp, Discord, redes sociais)

**Consequências:**
- URLs longas para pistas com muitos nós (> 50 nós pode ultrapassar 2000 chars em alguns browsers)
- Sem controle de versão: se a estrutura do JSON mudar, links antigos quebram
- Solução para V2: salvar no banco e usar UUID curto, com fallback para base64

---

## ADR-009 — Supabase project ID: reutilizar projeto existente

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
Ao tentar criar um projeto Supabase novo para o Crash Coaster, o plano Free da Lovable/Supabase limita 2 projetos ativos. Ambos os slots já estavam ocupados.

**Opções consideradas:**
1. Pausar projeto não utilizado e criar novo
2. Reutilizar projeto existente `hafxruwnggitvtyngedy` (atual)
3. Fazer upgrade do plano Supabase

**Decisão:**
Reutilizar `hafxruwnggitvtyngedy` (sa-east-1, Brasil) — já existia com tabela `profiles` de outro contexto.

**Motivo:**
- Evita pausar projetos sem entender o impacto
- `hafxruwnggitvtyngedy` já está na região sa-east-1 (Brasil) — ideal para o público-alvo
- Migrations podem ser aplicadas via MCP sem alterar o que já existe

**Consequências:**
- Tabela `profiles` já existia com colunas diferentes (`full_name`, `points`, `experience`, `role`) → solução via `ALTER TABLE ADD COLUMN IF NOT EXISTS`
- Colunas legadas mantidas para não quebrar dados existentes
- `types.ts` deve incluir ambas as colunas legadas e as novas do CC

---

## ADR-010 — Sistema de documentação viva com hooks do Claude Code

**Data:** 2026-05-11
**Status:** Aceito

**Contexto:**
Projetos com IA (Claude Code) tendem a perder contexto entre sessões. Cada sessão recomeça do zero e o agente pode contradizer decisões anteriores ou ignorar o estado real do projeto.

**Opções consideradas:**
1. Atualizar docs manualmente quando lembrar
2. Hook pós-commit que detecta mudanças e lembra de atualizar docs (atual)
3. CI/CD que bloqueia merge sem atualização de changelog

**Decisão:**
`CLAUDE.md` como fonte primária de verdade + hook `post-commit-docs.sh` que detecta arquivos alterados e exibe lembretes contextuais específicos.

**Motivo:**
- `CLAUDE.md` é lido automaticamente pelo Claude Code a cada sessão
- Hook diferencia o que mudou: `src/` → ARCHITECTURE, `supabase/` → CLAUDE.md, `public/` ou `src/routes/` → CHANGELOG
- Custo zero: um script bash simples, sem CI extra
- Garante que qualquer dev (humano ou IA) saiba exatamente o estado atual

**Consequências:**
- Docs só ficam atualizados se o dev (ou IA) responder ao lembrete — não é automático
- Solução futura: CI que valida se `CHANGELOG.md` foi tocado em PRs que alteram rotas ou banco

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
