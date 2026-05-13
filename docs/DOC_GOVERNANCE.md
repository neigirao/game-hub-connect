# Governança da Documentação

> Objetivo: garantir que a documentação continue útil com múltiplos devs e IAs contribuindo.

## 1) Donos por documento

| Documento | Dono primário | Backup |
|---|---|---|
| `ARCHITECTURE.md` | Tech Lead / Arquiteto | Dev responsável pela feature que alterou fluxo |
| `API_MATRIX.md` | Dev de integração/backoffice | QA técnico / IA revisora |
| `ROADMAP.md` | PM/Lead | Tech Lead |
| `CHANGELOG.md` | Autor da PR | Reviewer da PR |
| `ONBOARDING.md` | Tech Lead | Dev onboarding buddy |

## 2) Regra de atualização (Definition of Done)

Uma PR só está pronta quando:
- [ ] Código implementado e validado;
- [ ] Docs impactados atualizados;
- [ ] `CHANGELOG.md` atualizado com data da sessão;
- [ ] Migrations citadas (se houver);
- [ ] APIs/RPCs novos mapeados em `API_MATRIX.md`.

## 3) Frequência de revisão

- **Semanal**: revisão rápida de consistência (`ARCHITECTURE`, `API_MATRIX`, `ROADMAP`).
- **Por release**: revisão editorial final e checagem de links.
- **Mensal**: limpeza de conteúdo obsoleto e pendências antigas.

## 4) Convenção de precisão

- Evitar termos vagos (“alguma tabela”, “endpoint novo”).
- Usar nomes exatos de rota, tabela, view, RPC e arquivo.
- Separar claramente:
  - **Estado atual** (já em produção)
  - **Plano futuro** (ideia/roadmap)

## 5) Sinais de documentação desatualizada

- Rota existente sem referência em docs.
- Migration aplicada sem menção no changelog.
- API chamada em código e ausente no `API_MATRIX`.
- Fluxo descrito em `ARCHITECTURE` divergente do comportamento real.

## 6) Protocolo de correção rápida

Ao encontrar inconsistência documental:
1. Abrir PR pequena “docs sync”.
2. Corrigir arquivo fonte da verdade.
3. Atualizar referências cruzadas.
4. Registrar no `CHANGELOG` (sessão do dia).
