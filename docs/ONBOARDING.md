# Onboarding Técnico (Dev + IA) — Crash Coaster

> Leia este arquivo primeiro ao entrar no projeto.

## 1) Comece por aqui (ordem recomendada)

1. `docs/README.md` (índice + checklist)
2. `docs/ARCHITECTURE.md` (visão macro)
3. `docs/API_MATRIX.md` (rastreabilidade de APIs)
4. `docs/ROADMAP.md` (prioridades)
5. `docs/DECISIONS.md` (ADRs)

## 2) Mapa de pastas (mental model rápido)

- `public/play.html`: engine do jogo (Canvas, física, editor).
- `src/routes/*`: app React (produto/admin).
- `src/integrations/supabase/*`: clientes e tipos do Supabase.
- `supabase/migrations/*`: fonte da verdade do banco.
- `docs/*`: documentação viva.

## 3) Fluxo padrão para qualquer mudança

1. **Entender impacto**: qual feature e quais tabelas/RPCs serão tocados.
2. **Implementar**: código da rota/engine/migration.
3. **Validar**: rodar checks aplicáveis.
4. **Documentar** (obrigatório):
   - Atualizar `docs/API_MATRIX.md` se API/tabela/RPC mudar.
   - Atualizar `docs/ARCHITECTURE.md` se fluxo/camada mudar.
   - Atualizar `docs/ROADMAP.md` se status/prioridade mudar.
   - Atualizar `docs/CHANGELOG.md` com data da sessão.

## 4) Convenções de documentação (para humanos e IA)

- Escrever de forma objetiva: **o que existe hoje** vs **o que é plano futuro**.
- Sempre citar nomes reais de tabela/view/RPC/rota (evitar “coisa”, “endpoint X”).
- Para cada mudança, registrar:
  - **Onde** (arquivo/pasta)
  - **Por quê** (objetivo)
  - **Como validar** (comando/check/manual)
- Evitar duplicar informação em 2 arquivos sem apontar uma fonte da verdade.

## 5) Checklist anti-perda de contexto

- [ ] A feature nova está mapeada no `API_MATRIX`.
- [ ] O fluxo atualizado está em `ARCHITECTURE`.
- [ ] O status da tarefa foi refletido no `ROADMAP`.
- [ ] A mudança entrou no `CHANGELOG`.
- [ ] Se houve migration, ela foi citada na documentação.

## 6) Armadilhas comuns do projeto

- `play.html` e React compartilham domínio/sessão, mas têm ciclos de vida diferentes.
- Nem toda feature React afeta engine, e vice-versa — documente o acoplamento quando existir.
- Mudanças de banco sem atualização de docs quebram onboarding rapidamente.
