# Corrigir `SyntaxError: Identifier 'showToast' has already been declared`

## Causa

`public/play.html` declara `function showToast(...)` duas vezes:

- **Linha 921** — versão "modal", usa `#globalToast`, assinatura `(msg, isError=false)`.
- **Linha 2450** — versão "rodapé", usa `#toast`, assinatura `(text, color='#FF4757')`.

Como ambas estão no mesmo `<script>` (modo estrito implícito do bundler), a segunda declaração lança `SyntaxError` e **todo o script para de carregar**. Resultado: nenhum handler de clique do editor é registrado, e qualquer botão do jogo fica inerte.

Há ~30 chamadas espalhadas, misturando os dois estilos:
- `showToast('msg', true)` → quer destacar erro
- `showToast('msg', '#FF6BD6')` → quer cor customizada
- `showToast('msg')` → caso default

## Correção

Manter **uma única** `showToast` que aceite os dois formatos e use ambos os elementos do DOM já presentes (`#toast` no rodapé é o usado pelo gameplay; `#globalToast` é o modal central usado por save/share).

### Passos

1. **Remover** a declaração da linha 921 (versão modal antiga).
2. **Substituir** a declaração da linha 2450 por uma versão unificada:
   - Detecta se o segundo argumento é boolean (modo erro) ou string (cor de borda).
   - Renderiza no `#toast` (rodapé) por padrão — é o elemento mais visível durante o gameplay.
   - Quando o segundo argumento é boolean, aplica cor vermelha (`--danger`) para erro e verde (`--safe`) para sucesso.
3. **Manter** a função `hideToast()` existente.
4. Não alterar nenhuma das ~30 chamadas — a nova assinatura é compatível com todas.

### Detalhes técnicos

```js
function showToast(text, opt) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = text;
  let color = '#FF4757';
  if (typeof opt === 'string') color = opt;
  else if (opt === true) color = '#FF4757';
  else if (opt === false) color = '#2ED573';
  t.style.borderColor = color;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2000);
}
```

## Verificação

- Recarregar `/play.html` e confirmar no console que **não** há mais `SyntaxError`.
- Clicar no canvas com a ferramenta Adicionar — nó deve aparecer.
- Testar botões da topbar (Build/Test, Loop, Salvar) — todos devem responder e o toast deve aparecer.

## Arquivos afetados

- `public/play.html` (apenas remoção/substituição das duas declarações de `showToast`)
