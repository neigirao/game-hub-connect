# Corrigir “carrinho parado ao testar” e ruído de 404 no console

## Diagnóstico

Investiguei `public/play.html`:

1. **Carrinho parado** — causa-raiz:
   - `initDefaultTrack()` (linha 1279) cria **apenas 1 nó** (a estação de partida).
   - `initCart()` (linha 2266) retorna `null` quando `state.nodes.length < 2`.
   - `startTest()` (linha 2283) faz `state.cart = initCart()` sem checar `null` → o `tick()` nunca entra na física porque `state.cart` é falsy. Resultado: o jogador clica **Testar**, nada acontece e nenhum aviso aparece.
   - O caso é comum ao abrir `play.html?level=1` antes do `loadLevelFromUrl()` async terminar (ou quando o usuário ainda não passou pela rota React e o `localStorage.cc_sb_url/key` não foi semeado, fazendo o fetch do level abortar).

2. **`404 (Not Found)`** — vem do `/favicon.ico`. O `play.html` não declara `<link rel="icon">`, então o navegador pede `/favicon.ico` e leva 404. Confirmado nas requisições de rede do preview.

3. **`A listener indicated an asynchronous response by returning true...`** — ruído de extensão de navegador (Chrome MV3), **não** é bug do jogo. Sem ação necessária além de documentar.

## Mudanças

### `public/play.html`

1. **Guarda em `startTest()`** — se `initCart()` retornar `null`:
   - mostrar toast `"Construa pelo menos 2 nós para testar 🛤️"`,
   - voltar `state.mode` para `'build'` e atualizar a UI dos botões via `setMode('build')` (sem reentrar em `startTest`),
   - fazer `return` antes de mexer em partículas/UI.

2. **`initDefaultTrack()` com 3 nós** (mini-rampa) em vez de 1 — assim o Testar funciona imediatamente em sessão nova:
   ```js
   state.nodes = [
     {x: r.width*0.2, y: r.height*0.35, kind:'normal'}, // estação alta
     {x: r.width*0.5, y: r.height*0.55, kind:'normal'},
     {x: r.width*0.8, y: r.height*0.65, kind:'normal'}, // chegada baixa
   ];
   ```
   Mantém `closedLoop = false` e a chamada de `pushHistory()`.

3. **Favicon inline** no `<head>`, eliminando o 404 sem precisar criar arquivo:
   ```html
   <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23170C3D'/%3E%3Ctext x='50%25' y='58%25' font-size='40' text-anchor='middle' fill='%23FF6BD6'%3E🎢%3C/text%3E%3C/svg%3E" />
   ```

## Não vou tocar

- Lógica de física, score, level loading, RLS — fora do escopo do bug reportado.
- O aviso "message channel closed" — origem em extensão do navegador, sem código do projeto envolvido.

## Verificação

- Abrir `/play.html` (sem `?level`) → clicar **Testar** → carrinho desce a mini-rampa.
- Abrir `/play.html?level=1` logado → starter track substitui o default e Testar roda normal.
- Apagar todos os nós e clicar Testar → toast `"Construa pelo menos 2 nós..."` aparece e o modo volta a Build.
- Console limpo: sem mais `404 favicon.ico`.

## Arquivos

- `public/play.html`
