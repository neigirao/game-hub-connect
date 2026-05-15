# Crash Coaster

> _"The game where failing is more fun than winning."_

Jogo sandbox 2D de construção de montanhas-russas para web browser. Construa pistas, lance o carrinho, acumule G-force e compartilhe o caos.

**Stack:** TanStack Start · React 19 · Supabase · Cloudflare Workers · Canvas 2D (vanilla JS)

---

## Setup rápido

```bash
# 1. Clone e instale
git clone https://github.com/neigirao/game-hub-connect.git
cd game-hub-connect
npm install

# 2. Configure variáveis de ambiente
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY

# 3. Rode em modo desenvolvimento
npm run dev
```

A aplicação abre em `http://localhost:3000`.  
O jogo fica disponível em `http://localhost:3000/play.html`.

---

## Comandos úteis

| Comando               | O que faz                                          |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento                        |
| `npm run build`       | Build de produção                                  |
| `npm run lint`        | ESLint                                             |
| `npx wrangler deploy` | Deploy Cloudflare Workers                          |
| Ver CLAUDE.md § 11    | Verificar sintaxe do `play.html` e outros comandos |

---

## Documentação

- **`CLAUDE.md`** — documentação viva: arquitetura, banco, armadilhas, decisões
- **`docs/GDD.md`** — Game Design Document
- **`docs/ARCHITECTURE.md`** — arquitetura técnica detalhada
- **`docs/DECISIONS.md`** — log de decisões arquiteturais (ADRs)
- **`docs/CHANGELOG.md`** — histórico de mudanças

---

## Projeto Supabase

- **Project ID:** `sekuurohkxqktpllebdd`
- **Admin:** `neigirao@gmail.com`
- **Branch de dev:** `claude/understand-application-WSjdS`
