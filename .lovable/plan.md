# Plano

Quatro frentes coordenadas. Tudo concentrado em `public/play.html`, rotas React (`index.tsx`, `login.tsx`, `campaign.tsx`, `_authenticated.tsx` novo) e `src/server.ts`. Documentação (CLAUDE.md §8/§9, CHANGELOG, ROADMAP) atualizada no mesmo PR — sem precisar pedir.

## 1. Tooltips ricos nas peças da toolbar

Hoje cada `.tool` tem só `title="Lançador (N)"`, que é o tooltip nativo lento e cinza do browser.

- Criar um dicionário `TOOL_INFO` no `play.html` com `{ name, key, desc, tip }` para os 16 botões (add, move, booster, brake, launcher, loop-node, spring, firework, ice, inversor, cannon, portal, delete, set-start, set-end, loop).
- Adicionar um `<div id="toolTooltip">` flutuante, escondido por padrão, posicionado ao lado direito da toolbar (`position:fixed; left: 175px; pointer-events:none`).
- Handlers `mouseenter`/`mouseleave`/`focus`/`blur` em cada `.tool` mostram um cartão estilizado: ícone grande, nome + atalho em destaque, descrição (1 frase) e dica de uso (ex.: "Catapulta o carrinho — ele pode cair de volta no trilho se a velocidade for boa!").
- Acessível: `aria-describedby` aponta para o tooltip; `title` nativo fica como fallback.
- Não exige novos assets — só CSS + JS no próprio `play.html`.

## 2. Recaptura do trilho ao voar (catapulta, mola, canhão, inversor sem velocidade)

Hoje, quando `c.flying = true`, a física só checa colisão com o `groundY` e leva a `setFailLevel(9)`. O carrinho nunca tenta voltar pro trilho. Vou trocar isso por um sistema de "rail catch" divertido.

**Loop principal (linhas ~4870–4890, bloco `else { // flying physics }`):**

A cada frame voando, depois de aplicar gravidade, fazer:

1. Amostrar `path` (já cacheado) e achar o sample mais próximo do `(c.x, c.y)` dentro de um raio `RAIL_CATCH_RADIUS = 28px` (busca linear nos samples, barata).
2. Se há sample candidato, calcular:
   - `vIncoming = Math.hypot(c.vx, c.vy)`
   - `vTangent = c.vx * tx + c.vy * ty` (projeção na direção do trilho)
   - `vNormal = c.vx * nx + c.vy * ny` (componente que "bate" no trilho)
3. Três regimes:
   - **Aterrissagem suave** (`|vNormal| < 350` e `vTangent > 80`): "Recaptura"! Snap `c.x/c.y` para o sample, `c.s = sample.s`, `c.v = Math.sign(vTangent) * Math.min(|vTangent|, MAX_V)`, `c.flying = false`, reduzir `failLevel` em 1, partícula verde + `showToast('🎯 DE VOLTA AOS TRILHOS!', '#2ED573')`. Mantém vidas.
   - **Quique** (`|vNormal| ≥ 350` e `|vNormal| < 800`): Bate e quica — reflete `vNormal` com coef. `-0.55`, `vTangent *= 0.85`, faísca + som curto, `showToast('💥 QUICOU!', '#FFA502')`. Continua voando, mas perde energia. Pode cair de novo e ser recapturado.
   - **Esmagamento** (`|vNormal| ≥ 800`): Bateu forte demais — vai pro `setFailLevel(9)` como hoje (crash).
4. Cooldown `c._railCatchCool` por ~150ms após recaptura para não re-disparar o launcher/spring no mesmo nó.

**Por que funciona com todas as peças:** Launcher, spring, cannon e inversor-sem-velocidade já setam `c.flying = true`. O sistema acima é agnóstico: qualquer "voo" ganha a mesma chance dramática de cair no trilho. Adiciona o "isso é hilário" do GDD sem mexer em cada peça individualmente.

**Tuning:** As constantes `RAIL_CATCH_RADIUS`, `LANDING_VNORMAL_MAX`, `BOUNCE_VNORMAL_MAX` ficam nomeadas no topo do `<script>` junto às outras (`GRAVITY`, `BOOSTER_ACCEL`).

## 3. Login obrigatório + jornada mais fluida

**Decisão de jornada:** Hoje a jornada é `home.html → /login → /campaign → /play.html`, mas `/play.html` permite jogar sem login (com o botão "Entrar" virando no-op se `sbClient` é null). Vou tornar login **obrigatório** sem virar fricção.

### 3a. Guard de auth em `/play.html`

- Adicionar early-check no `init()` do `play.html`: ler `cc_sb_url`/`cc_sb_key` e tentar `supabase.auth.getSession()`.
- Se sem sessão: substituir o canvas por um overlay full-screen "Faça login para jogar" com um único botão **Entrar com Google** (estilo já existente no `/login`) que dispara `signInWithOAuth({ redirect_uri: origin + '/play.html' + window.location.search })` — preservando `?level=` para não perder a fase.
- Remove o atual botão "Entrar" do canvas (que hoje era no-op), simplificando.

### 3b. Worker reforça login

- Em `src/server.ts`, criar a regra: `GET /play.html` sem cookie de sessão Supabase → 302 para `/login?redirect=/play.html<query>`. Cookie name: `sb-${ref}-auth-token` (Supabase). É soft — se o cookie estiver lá, deixa passar (revalidação real fica no client). Se não estiver, evita carregar 3500 linhas pra mostrar overlay.

### 3c. Login mais fluido (`/login`)

- Reescrever `src/routes/login.tsx`: card maior, brand "🎢 Crash Coaster", subheadline ("Construa. Destrua. Compartilhe."), botão Google grande, e um link sutil "Como funciona?" que abre `/home.html` em nova aba.
- Loading state visual: o botão vira spinner inline com texto "Abrindo Google…" em vez do atual "Conectando…" sem feedback.
- Preservar `?redirect=` da URL e usar como `redirect_uri` (default: `/campaign`).
- Layout responsivo: usar paleta do jogo (`#170C3D` background, gradiente roxo, tipografia Fredoka) em vez do `#0a0420` plano atual — alinha visualmente com home/campaign.

### 3d. Home → Login mais convidativo

- `home.html`: o CTA principal "Jogar agora" hoje aponta para `/play.html`. Trocar para `/login?redirect=/campaign` (jornada: home → login → campaign → escolher fase → jogar). O CTA secundário "Ver demo" continua indo para `/play.html?demo=1` (no-auth, modo somente-leitura mostrando uma pista pronta rodando — opcional, fica em backlog se for muito grande).
- Atualizar CTA do `index.tsx`: sem sessão, mandar para `/login` direto (já é o caso de `home.html`); manter `/campaign` quando logado.

### 3e. Rota `_authenticated` para tudo que é pessoal

- Criar `src/routes/_authenticated.tsx` com `beforeLoad` chamando `supabase.auth.getSession()` — se null, `throw redirect({ to: '/login', search: { redirect: location.href } })`.
- Mover `campaign.tsx`, `profile.tsx`, `shop.tsx`, `leaderboard.tsx` (esse último permanece público? — manter público; mover só campaign/profile/shop) para dentro do diretório `_authenticated/`. Garante que nenhuma rota logada vaze pra anônimo.

## 4. "O preview sempre tem que funcionar"

Trauma recorrente: edição em `play.html` quebra o `<script type="module">` inteiro (armadilha #1 do CLAUDE.md §9). Vou endurecer o pipeline.

- **Verificação automática no CI** (`.github/workflows/ci.yml`): job já roda `node --check` no script de `play.html`. Confirmar que continua passando.
- **Pre-commit** (`.husky/pre-commit`): adicionar o mesmo check via `node -e "..." && node --check /tmp/pc.mjs` para o `play.html`. Bloqueia commit se quebrar.
- **Smoke test em build:dev**: adicionar `src/routes/_health.tsx` muito pequeno que importa as 4 rotas principais e renderiza "ok". Isso força o TanStack a compilar o routeTree e quebra o build se uma rota tiver erro de sintaxe.
- **Auth guard com fallback gracioso**: o overlay de login no `play.html` (§3a) NÃO depende de `sbClient` carregar — se a CDN do Supabase falhar, mostra o overlay com botão que vai pra `/login`. Sem tela branca.
- **`onAuthStateChange` defensivo** (`__root.tsx`): envolver em try/catch o `queryClient.invalidateQueries()` para um throw no listener não derrubar o React.

## 5. Documentação (faço junto, sem pedir)

- `CLAUDE.md` §4: adicionar "Sistema de rail-catch (recaptura de voo)" e "Tooltips ricos da toolbar".
- `CLAUDE.md` §8 marcar como implementados: tooltips, rail-catch, login obrigatório, `_authenticated` layout.
- `CLAUDE.md` §9: nova armadilha — "Recaptura de trilho precisa de cooldown senão launcher dispara em loop"; "auth guard no play.html não pode depender de CDN externa".
- `docs/CHANGELOG.md`: nova Sessão 17.
- `docs/ROADMAP.md`: remover itens migrados.

## Validação

- `node --check` no script de `play.html`.
- Manual: subir editor, hover em cada ferramenta → tooltip aparece com texto correto; colocar carrinho num launcher → voa, deve às vezes cair no trilho e continuar (toast verde), às vezes quicar (toast laranja).
- Abrir `/play.html` em janela anônima → ver overlay de login imediato.
- `/login?redirect=/play.html?level=3` → logar → cair em `/play.html?level=3`.
- `/campaign` sem sessão → redirect pra `/login`.
- Preview do Lovable sobe sem branco.

## Fora de escopo

- Não vou refatorar `play.html` para módulos (continua no backlog grande).
- Não vou tocar nas tabelas Supabase nem em RLS — login obrigatório é puramente client+worker.
- "Modo demo" (`?demo=1`) sem login fica como opcional em backlog se passar do orçamento desta entrega.
- Mobile/touch continua fora.
