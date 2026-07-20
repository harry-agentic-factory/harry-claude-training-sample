# Règle — Zéro secret exposé (toujours active)

## Principe
Un secret ne doit **jamais** entrer dans le contexte de l'IA, ni dans le repo, ni dans les logs.
Cette règle **double** le hook `block-secret-exposure.sh` : la règle guide, le hook empêche.

## Obligatoire
- Secrets via **variables d'environnement** / `.env` (git-ignoré) / GitHub Secrets. Placeholder = `CHANGEME`.
- Jamais de secret en clair dans le code, un commit, un `ARG` Docker, un message de log.
- Ne pas afficher un secret en sortie de commande (`echo $TOKEN`, `env`, `kubectl get secret -o yaml`) —
  rediriger vers un fichier si besoin.
- Vérifier `.gitignore` (`.env`, `*.pem`, `*.key`) **avant** tout commit.

## Interdit
- Committer `.env`/clé · logger un token · désactiver le hook secrets sans raison (`~/.claude-allow-secrets`).
