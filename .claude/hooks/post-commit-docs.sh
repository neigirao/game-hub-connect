#!/bin/bash
# Executa após cada commit via Claude Code.
# Verifica se arquivos relevantes foram alterados e lembra de atualizar a documentação.

CHANGED=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only HEAD 2>/dev/null)

# Detecta mudanças que exigem atualização de docs
NEEDS_ARCH=false
NEEDS_CHANGELOG=false
NEEDS_CLAUDE=false

echo "$CHANGED" | grep -qE "^(src/|public/play\.html|supabase/|wrangler\.jsonc|vite\.config|package\.json)" && NEEDS_ARCH=true
echo "$CHANGED" | grep -qE "^(public/|src/routes/|src/integrations/)" && NEEDS_CHANGELOG=true
echo "$CHANGED" | grep -qE "^(src/integrations/supabase/types\.ts|supabase/)" && NEEDS_CLAUDE=true

if $NEEDS_ARCH || $NEEDS_CHANGELOG || $NEEDS_CLAUDE; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║          LEMBRETE: Atualizar documentação viva               ║"
  echo "╠══════════════════════════════════════════════════════════════╣"

  if $NEEDS_CHANGELOG; then
    echo "║  → docs/CHANGELOG.md   Registrar a mudança na seção         ║"
    echo "║                        [Não lançado]                        ║"
  fi

  if $NEEDS_ARCH; then
    echo "║  → docs/ARCHITECTURE.md  Verificar se algum diagrama ou     ║"
    echo "║                          decisão técnica mudou              ║"
  fi

  if $NEEDS_CLAUDE; then
    echo "║  → CLAUDE.md           Atualizar schema do banco ou status  ║"
    echo "║                        de features implementadas/pendentes  ║"
  fi

  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
fi
