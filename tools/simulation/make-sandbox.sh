#!/usr/bin/env bash
# Builds a throwaway copy of the repo for simulated trainee sessions.
# The copy has a fresh git history, no remote (a push cannot reach anything) and a clean working tree.
# Usage: bash tools/simulation/make-sandbox.sh <target-dir> [--feature]
#   --feature  adds a minimal docs/features/echeance-taches.md, the prerequisite of modules 11, 12 and 14.
set -euo pipefail
repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
target="${1:?usage: make-sandbox.sh <target-dir> [--feature]}"
dest="$target/repo"
mkdir -p "$dest"

rsync -a --exclude .git --exclude node_modules --exclude backend/.venv --exclude .formation \
  --exclude .playwright-mcp --exclude .claude/settings.local.json \
  --exclude tools/harry-ai-tutor/dist --exclude tools/harry-ai-tutor/node_modules "$repo/" "$dest/"

if [ "${2:-}" = "--feature" ]; then
  mkdir -p "$dest/docs/features"
  printf '%s\n' '# Feature: task due date' '' '## Acceptance criteria' \
    '- Given a task, When a due date is set, Then it is displayed.' '' '## Invariants' \
    '- A task without a due date stays valid.' > "$dest/docs/features/echeance-taches.md"
fi

git -C "$dest" init -q
git -C "$dest" config user.name Trainee
git -C "$dest" config user.email trainee@example.com
git -C "$dest" add -A
git -C "$dest" commit -q -m "chore: sandbox snapshot"
echo "sandbox ready: $dest (no remote, clean tree)"
