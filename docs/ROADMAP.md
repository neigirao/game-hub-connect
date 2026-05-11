# Roadmap de Tarefas — Crash Coaster

> Backlog priorizado por fase. Cada tarefa tem contexto, critério de aceite e dependências.
> Atualizar conforme as sessões avançam. Marcar com ✅ ao concluir.

---

## Como usar este arquivo

- **Status:** `[ ]` pendente · `[~]` em andamento · `[x]` feito
- **Prioridade:** 🔴 bloqueante · 🟠 alta · 🟡 média · 🟢 nice-to-have
- Cada tarefa tem **critério de aceite** claro para qualquer dev/IA saber quando está "done"

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
- [ ] Link para a pista do score (`blueprint_id` → compartilhar)
- [ ] Atualização em tempo real com Supabase Realtime (opcional para MVP)

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

- [ ] **Stall detection:** exibir "PARADO! 😴" se o carrinho ficar parado por >3s e encerrar o run
- [ ] **Velocidade mínima reversa:** impedir que o carrinho volte indefinidamente com velocidade negativa alta
- [ ] **Novo nó: Lançador** — catapulta que expulsa o carrinho para o ar propositalmente (kind: `launcher`)
- [ ] **Looping 360°** — nó especial que força o carrinho a fazer uma volta completa sem crash (kind: `loop`)
- [ ] **Efeito de túnel:** se o carrinho passa por um ponto muito rápido, deixar rastro de velocidade (motion blur simples)
- [ ] **Sons** — Web Audio API com 3 sons: trilho normal, booster, crash (sem assets externos, gerado por síntese)

**Critério de aceite:** Cada item verificado individualmente. Sons devem funcionar sem CORS e sem arquivos externos.

---

### 🟡 P3 — Sistema de Coins e XP

**Contexto:** As colunas `coins` e `xp` existem em `profiles` mas nunca são atualizadas.

- [ ] Definir tabela de recompensas: corrida completa = +50 XP, crash = +10 XP (caos é recompensado), nova estrela = +100 coins
- [ ] Criar função Supabase `award_run_rewards(user_id, stars, crashed)` para calcular e atualizar atomicamente
- [ ] Chamar essa função ao `completeRun()` no `play.html`
- [ ] Tela de perfil exibir a animação de ganho de XP/coins (flash verde)
- [ ] Definir limiares de level: level 1 = 0 XP, level 2 = 200 XP, level 3 = 500 XP...

**Critério de aceite:** Após corrida, XP e coins são incrementados no banco e visíveis na tela de perfil.

**Dependências:** Tela de perfil (P1)

---

### 🟡 P3 — Navegação e Shell React

**Contexto:** Hoje o app tem só `/login` e `/`. Não há navegação entre telas.

- [ ] Navbar persistente no `__root.tsx` com links: Jogar, Campanha, Ranking, Perfil
- [ ] Navbar mostra avatar do usuário logado ou botão "Entrar" se não logado
- [ ] Rota `/play` que serve o `play.html` num iframe ou redireciona para `/play.html`
- [ ] Loading states com Skeleton para todas as queries de banco
- [ ] Error boundary com mensagem amigável para falhas de rede

**Critério de aceite:** Usuário consegue navegar entre todas as telas sem usar URL manual.

---

## FASE V2 — Pós-MVP

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

### 🟢 Temporadas e eventos

- [ ] Temporada mensal: `season = 'YYYY-MM'` já suportado no banco
- [ ] Reset automático do ranking mensal (cron no Supabase ou Edge Function)
- [ ] Desafio semanal: fase especial com objetivos únicos e recompensa exclusiva
- [ ] Badge de "Campeão da Temporada" no perfil

### 🟢 Mobile-first

- [ ] Detectar touch events no `play.html`
- [ ] UI adaptativa: tools panel como bottom sheet no mobile
- [ ] Joystick virtual para mover nós no touch
- [ ] Testar em iOS Safari e Android Chrome

---

## Decisão: Próxima sessão

Sugestões de próximos passos baseadas no impacto para o jogador:

| Opção | Impacto | Complexidade | Recomendação |
|---|---|---|---|
| Tela de Perfil | Alto (progresso visível) | Baixa (React + query simples) | ⭐ Começar aqui |
| Ranking Global | Alto (competição) | Baixa (view já existe) | ⭐ Em seguida |
| Campanha (fases) | Muito alto (loop de jogo) | Alta (integração play.html) | Depois do perfil |
| Física melhorada | Médio (mais fun) | Média (só play.html) | A qualquer momento |

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
