#!/usr/bin/env bash
# Prépare l'environnement local sans rien supposer du poste : choisit un Python >= 3.12 et un Node >= 18,
# crée le venv du backend, installe les dépendances. Idempotent (sans risque à relancer).
# Usage : bash tools/setup.sh        (macOS, Linux, Windows via Git Bash)
set -euo pipefail
repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo"

MIN_PY="3.12"   # aligné sur backend/Dockerfile
MIN_NODE=18     # Vite 6 ; .nvmrc vise 20 (requis pour empaqueter l'extension)

ver_ge() { [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]; }   # ver_ge <a> <b> : a >= b

# --- Python -----------------------------------------------------------------------------------------
PY=""
for c in python3.13 python3.12 python3 python; do
  command -v "$c" >/dev/null 2>&1 || continue
  v="$("$c" -c 'import sys; print("%d.%d" % sys.version_info[:2])' 2>/dev/null || true)"
  if [ -n "$v" ] && ver_ge "$v" "$MIN_PY"; then PY="$c"; break; fi
done
if [ -z "$PY" ]; then
  echo "✗ Python >= $MIN_PY introuvable."
  echo "  macOS   : brew install python@3.13"
  echo "  Windows : winget install Python.Python.3.13"
  echo "  Linux   : installe python3.12+ avec ton gestionnaire de paquets"
  exit 1
fi
echo "✓ Python : $PY ($("$PY" --version))"

if [ ! -d backend/.venv ]; then
  echo "… création de backend/.venv"
  "$PY" -m venv backend/.venv
fi
if [ -x backend/.venv/bin/python ]; then VPY="backend/.venv/bin/python"; else VPY="backend/.venv/Scripts/python.exe"; fi
echo "… dépendances backend (dans le venv)"
"$VPY" -m pip install -q -r backend/requirements.txt   # toujours « python -m pip » : jamais le pip du système

# --- Node -------------------------------------------------------------------------------------------
node_major() { node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0; }
if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ] && [ "$(node_major)" -lt 20 ]; then
  # nvm présent et Node < 20 : bascule sur la version du .nvmrc si elle est déjà installée (sans rien télécharger)
  # shellcheck disable=SC1091
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" >/dev/null 2>&1 || true
  nvm use --silent >/dev/null 2>&1 || true
fi
if ! command -v node >/dev/null 2>&1 || [ "$(node_major)" -lt "$MIN_NODE" ]; then
  echo "✗ Node >= $MIN_NODE introuvable (trouvé : $(node --version 2>/dev/null || echo aucun))."
  echo "  macOS   : brew install node   ·   Windows : winget install OpenJS.NodeJS.LTS   ·   ou nvm install 20"
  exit 1
fi
echo "✓ Node : $(node --version)"
echo "… dépendances frontend"
(cd frontend && npm install --no-audit --no-fund --loglevel=error)

echo
echo "✓ Environnement prêt. Backend : backend/.venv · Frontend : frontend/node_modules"
