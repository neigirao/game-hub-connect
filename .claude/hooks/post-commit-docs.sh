#!/bin/bash
# Hook executado pelo Claude Code após cada commit.
# Verifica se arquivos relevantes foram modificados e lembra de atualizar a documentação.

CHANGED=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || git show --name-only --format="" HEAD 2>/dev/null)

NEEDS_ARCH=false
NEEDS_DB=false
NEEDS_GAME=false

echo "$CHANGED" | grep -qE "^src/|^vite\.config|^wrangler|^package\.json" && NEEDS_ARCH=true
echo "$CHANGED" | grep -qE "supabase/|types\.ts" && NEEDS_DB=true
echo "$CHANGED" | grep -qE "^public/play\.html" && NEEDS_GAME=true

if $NEEDS_ARCH || $NEEDS_DB || $NEEDS_GAME; then
  echo ""
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║        📝  DOCUMENTAÇÃO — LEMBRETE PÓS-COMMIT        ║"
  echo "╠══════════════════════════════════════════════════════╣"
  if $NEEDS_ARCH; then
    echo "║  → Arquivos de infra/stack alterados                ║"
    echo "║    Atualizar: CLAUDE.md (seção Stack/Estrutura)     ║"
    echo "║              docs/ARCHITECTURE.md                   ║"
  fi
  if $NEEDS_DB; then
    echo "║  → Schema ou tipos Supabase alterados               ║"
    echo "║    Atualizar: CLAUDE.md (seção Banco de Dados)      ║"
    echo "║    Rodar:  npx supabase gen types typescript        ║"
    echo "║            --project-id sekuurohkxqktpllebdd        ║"
    echo "║            > src/integrations/supabase/types.ts     ║"
  fi
  if $NEEDS_GAME; then
    echo "║  → play.html alterado (engine do jogo)              ║"
    echo "║    Atualizar: CLAUDE.md (seção Como o Jogo Funciona)║"
    echo "║              docs/GDD.md se mudou gameplay          ║"
  fi
  echo "║                                                      ║"
  echo "║  Sempre atualizar: docs/CHANGELOG.md                 ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo ""
fi
