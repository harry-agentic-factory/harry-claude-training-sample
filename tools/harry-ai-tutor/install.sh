#!/usr/bin/env bash
# Installe dans VS Code : l'extension officielle Claude Code (si absente) puis Harry AI Tutor (.vsix du dossier).
# Usage : bash tools/harry-ai-tutor/install.sh      (macOS, Linux, Windows via Git Bash)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd "$here/../.." && pwd)"

if ! command -v code >/dev/null 2>&1; then
  echo "✗ La commande 'code' (VS Code) n'est pas dans le PATH."
  echo "  macOS   : dans VS Code, Cmd+Shift+P → « Shell Command: Install 'code' command in PATH », puis relance le terminal."
  echo "  Windows : relance le terminal après l'installation de VS Code (l'installeur ajoute 'code' au PATH)."
  exit 1
fi

vsix="$(ls -1 "$here"/harry-ai-tutor-*.vsix 2>/dev/null | sort -V | tail -1 || true)"
if [ -z "$vsix" ]; then
  echo "✗ Aucun fichier harry-ai-tutor-*.vsix dans $here (générer avec : cd tools/harry-ai-tutor && npm install && npm run package)."
  exit 1
fi

if code --list-extensions 2>/dev/null | grep -qi '^anthropic\.claude-code$'; then
  echo "✓ Extension Claude Code déjà installée"
else
  echo "… Installation de l'extension Claude Code (Anthropic) depuis le Marketplace"
  code --install-extension anthropic.claude-code
fi

echo "… Installation de Harry AI Tutor ($(basename "$vsix"))"
code --install-extension "$vsix" --force

echo
echo "✓ Terminé. Ouvre le repo dans VS Code :  code \"$repo\""
echo "  Puis : icône Harry (barre de gauche) → « Démarrer la formation »."
echo "  (Si VS Code est déjà ouvert : Ctrl+Shift+P → « Developer: Reload Window ».)"
