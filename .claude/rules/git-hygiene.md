# Règle — Hygiène Git (toujours active)

## Principe
Historique propre, branches protégées protégées, rien ne se perd.

## Obligatoire
- **Conventional Commits** : `type(scope): description` (`feat`/`fix`/`docs`/`refactor`/`test`/`chore`/`ci`).
- **Jamais de push direct** sur `main`/`master`/`production` → branche + PR. (Doublé par le hook
  `block-protected-branch.sh`.)
- **Archivage > suppression** : ne pas `rm` un fichier ; le déplacer dans `_toDelete/<horodatage>__<slug>/`
  avec une note (raison, date). *(Aligne avec la règle maison `always-historize-deletions`.)*
- Un changement de comportement d'API s'accompagne d'une mise à jour de `docs/technical.md` (contrat).

## Interdit
- `git push origin main` en direct · `git reset --hard`/`git clean -fd` sans sauvegarde · commit d'un secret.
