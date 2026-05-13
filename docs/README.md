# Documentação — Crash Coaster

## Índice rápido

- `ARCHITECTURE.md`: arquitetura atual, fluxos, mapa de código, integrações.
- `API_MATRIX.md`: matriz de APIs consumidas por feature e arquivo.
- `ROADMAP.md`: backlog priorizado e critérios de aceite.
- `DECISIONS.md`: ADRs (decisões arquiteturais).
- `CHANGELOG.md`: histórico por sessão.
- `GDD.md`: visão de game design e direção de produto.
- `ONBOARDING.md`: guia de entrada rápida para novos devs e IAs.
- `HANDOFF_TEMPLATE.md`: template padrão para passagem de contexto.
- `DOC_GOVERNANCE.md`: regras de manutenção contínua da documentação.

## Checklist de qualidade para cada PR

- [ ] Reflete estado atual da feature (sem “futuro” já entregue).
- [ ] Cita fonte da verdade técnica (arquivo/rota/tabela/RPC).
- [ ] Lista impacto no banco (migration/tabela/view/policy).
- [ ] Lista impacto em API (Auth/REST/RPC/Realtime).
- [ ] Atualiza changelog com data da sessão.
- [ ] Se alterou fluxo entre React e `play.html`, atualizou diagrama/fluxo.

## Padrão recomendado para novas páginas

1. **Objetivo da página** (o que resolve no produto)
2. **Dependências** (tabelas, views, RPC, auth)
3. **Estados de UI** (loading, empty, error)
4. **Observabilidade** (logs/eventos/erros esperados)
5. **Riscos e limites** (RLS, performance, fallback)

## Lacunas documentais que ainda valem abrir

- Runbook operacional de incidentes (auth fora, Supabase indisponível, falha em RPC).
- Guia de RLS/policies por tabela (com exemplos de permissão por perfil).
- Guia de deploy/release e rollback (Cloudflare + migrations Supabase).
