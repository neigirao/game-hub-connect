# API Matrix — Crash Coaster

> Última atualização: 2026-05-13
> Objetivo: dar rastreabilidade rápida entre recurso de produto, API consumida e ponto do código.

## Supabase Auth

| Recurso                      | API                                                     | Onde no código                                                               |
| ---------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Detectar sessão inicial      | `supabase.auth.getSession()`                            | `src/routes/index.tsx`, `src/routes/profile.tsx`, `src/routes/challenge.tsx` |
| Atualizar UI em login/logout | `supabase.auth.onAuthStateChange()`                     | `src/components/game-nav.tsx`                                                |
| Login com Google             | `supabase.auth.signInWithOAuth({ provider: 'google' })` | `src/routes/login.tsx`, `src/integrations/lovable/index.ts`                  |

## Supabase Database / PostgREST

| Recurso              | Tabela/View                                        | Operações principais         | Onde no código                                                                 |
| -------------------- | -------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| Perfil do jogador    | `profiles`                                         | `select`, `update`           | `src/routes/profile.tsx`, `src/routes/shop.tsx`, `src/routes/admin/users.tsx`  |
| Pistas da comunidade | `blueprints`                                       | `select`, `update`, `delete` | `src/routes/tracks.tsx`, `src/routes/admin/blueprints.tsx`, `public/play.html` |
| Ranking              | `leaderboard_entries`, `leaderboard_with_profiles` | `select`, `insert`           | `src/routes/leaderboard.tsx`, `src/routes/challenge.tsx`, `public/play.html`   |
| Campanha             | `levels`                                           | `select`, `insert`, `update` | `src/routes/campaign.tsx`, `src/routes/admin/levels.tsx`, `public/play.html`   |
| Desafio diário       | `daily_picks`                                      | `select`                     | `src/routes/challenge.tsx`                                                     |
| Curtidas             | `blueprint_likes`                                  | `select`                     | `src/routes/tracks.tsx`                                                        |

## Supabase RPC

| Recurso                 | RPC                          | Onde no código          |
| ----------------------- | ---------------------------- | ----------------------- |
| Recompensas pós-corrida | `award_run_rewards(...)`     | `public/play.html`      |
| Curtir/descurtir pista  | `toggle_blueprint_like(...)` | `src/routes/tracks.tsx` |

## Realtime

| Recurso                        | Canal                                       | Onde no código               |
| ------------------------------ | ------------------------------------------- | ---------------------------- |
| Atualização ao vivo de ranking | `postgres_changes` em `leaderboard_entries` | `src/routes/leaderboard.tsx` |

## Observações

- O backend principal hoje é Supabase (Auth + PostgREST + RPC + Realtime); não existe API REST proprietária extensa no Worker.
- Sempre que uma rota nova consumir tabela/view/RPC, atualizar este arquivo e `docs/ARCHITECTURE.md` na mesma PR.
