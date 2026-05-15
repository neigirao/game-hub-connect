# Plano

Três correções de UX em `public/play.html` + `src/routes/login.tsx`, com sincronização da documentação ao final (sem precisar pedir de novo).

## 1. Toolbar do editor — duas colunas (sem scroll)

**Arquivo:** `public/play.html` (CSS `.tools` em ~L102 e `.tool` em ~L111)

- Trocar `display:flex; flex-direction:column` por `display:grid; grid-template-columns: repeat(2, 1fr); gap:6px`.
- Reduzir `.tool` de `64×64` para `54×54` (ícone `22×22`, label `9px`).
- `.divider` e `.hint` recebem `grid-column: 1 / -1` para ocuparem a linha inteira.
- `.legend-btn` também full-width na grid.
- Padding lateral do `.tools` reduzido para `8px 6px`.
- Resultado: 14 botões + 4 dividers cabem em viewport 769px sem scroll. Fallback: `overflow-y:auto` no `.tools` caso a viewport fique abaixo de ~620px.

## 2. Login → cair direto em `/campaign`

**Arquivo:** `src/routes/login.tsx`

- Trocar `redirect_uri: window.location.origin` por `redirect_uri: window.location.origin + "/campaign"`. Hoje o callback volta em `/`, que então redireciona para `/campaign`; com isso eliminamos o salto duplo e qualquer chance de cair no `/home.html` por race da sessão.
- Manter o fallback `window.location.href = "/campaign"` para o caminho não-redirected.

## 3. Botão "Campanha" no modal de Game Over

**Arquivo:** `public/play.html` (modal em ~L797 e handlers em ~L3553)

- Adicionar `<button class="bbtn" id="rcCampaignBtn">🗺️ Campanha</button>` no `.rc-buttons`, antes de "Editar Pista".
- Handler: `location.href = '/campaign'`.
- Visível sempre (tanto em vitória quanto em crash). Texto e ícone consistentes com a paleta existente.

## 4. Documentação (faço junto, sem pedir)

- `CLAUDE.md` § 8: marcar "toolbar 2 colunas", "login → /campaign direto", "botão Campanha no modal de resultado" como implementados; § 9: adicionar armadilha "redirect_uri OAuth deve apontar para `/campaign` para evitar flash em `/`".
- `docs/CHANGELOG.md`: nova entrada Sessão 15 (2026-05-15) listando os três itens.
- `docs/ROADMAP.md`: remover/mover os itens correspondentes da fila aberta, se existirem.

## Validação

- `node --check` no script de `play.html` (rotina já documentada na § 11 do CLAUDE.md).
- Screenshot do editor em 1462×769 confirmando todos os botões visíveis.
- Conferir no preview: clicar Entrar → cai em `/campaign`; rodar uma corrida até crash → modal mostra botão Campanha funcional.

## Fora de escopo

- Não vou tocar na física, no schema do banco, nem no fluxo OAuth do `play.html` (o "Entrar com Google" do canvas já redireciona para `/login` quando `sbClient` é nulo).
- Não vou refatorar `play.html` para módulos — está no backlog mas é mudança grande demais.
