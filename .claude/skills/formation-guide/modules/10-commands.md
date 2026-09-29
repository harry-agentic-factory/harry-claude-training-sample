# Module 10 — Predefined commands (slash commands)
Fiche : §10 · Profils : tous (po : pas 1-2 · dev / techlead : pas 1-4) · Durée : dev ~45 min · po ~25 min

## Concept
Une command = un fichier `.claude/commands/<nom>.md` = un prompt réutilisable avec `$ARGUMENTS`,
exécuté **dans ta session** (contexte partagé). Le cycle du repo : `/scope` (cadrer) → `/spec`
(critères + plan + invariants) → `/implement` (coder pas à pas) → `/test` (recetter).
`/formation` en est une aussi : ouvre `.claude/commands/formation.md` pour voir.

## Pas 1/4 — Cadrer une idée (/scope)
**Exercice (po)** : choisis une idée métier pour l'app todo qui te parle (ex. « rappel par email la
veille de l'échéance », « tâches partagées entre collègues »). Tape :
```
/scope <ton idée>
```
Lis le mini-PRD produit dans `docs/features/<slug>.md`. Corrige-le à la voix si le périmètre n'est pas
celui que tu veux (« exclus le multi-utilisateur »).
**Exercice (dev / techlead)** : `/scope ajouter une date d'échéance aux tâches`
**Vérification** : je vérifie qu'un nouveau fichier existe dans `docs/features/` (`git status --short`).

## Pas 2/4 — Spécifier (/spec)
**Exercice (tous)** : prends la **première story** de ton PRD et tape, en demandant d'écrire dans le
**même** fichier :
```
/spec <story 1 de ton PRD> — dans docs/features/<slug>.md
```
(dev : `/spec TODO-2 champ dueDate + tri par échéance — dans docs/features/<slug>.md` ; `TODO-2` est
ton identifiant de story, libre.) Lis les 3 blocs : critères Given / When / Then, plan back / front,
**invariants** (la checklist que le reviewer appliquera au module 11).
po : ces critères d'acceptation, les aurais-tu écrits ainsi ? Modifie-les à la voix.
**Vérification** : je vérifie qu'un fichier de `docs/features/` contient une section critères **et** une section
invariants (le même que le PRD, ou un second : dis-moi lequel, je le note).

## Pas 3/4 — Implémenter (/implement) — dev / techlead
**Exercice** : `/implement`. Claude déroule le plan, lance les tests (`docker run` ou `pytest` selon
ton mode) et `npm run build` à chaque étape, commit par étape sur ta branche. **Reste dans la
boucle** : lis chaque diff avant d'accepter. Si un test casse, laisse-le corriger et vérifie qu'il
relance les tests.
**Vérification** : je vérifie que `git log --oneline main..HEAD` montre ≥ 1 commit en Conventional
Commits, et que les tests passent :
- mode docker : `docker run --rm -v "$PWD/backend:/app" -w /app local/todo-backend pytest -q`
  (Windows / Git Bash : `MSYS_NO_PATHCONV=1` devant la commande).
- mode natif : `pytest -q` dans `backend/` (venv activé).

## Pas 4/4 — Recetter (/test) — dev / techlead
**Exercice** : mode docker : rebuild (`docker compose up --build -d`). Mode natif : rien à rebuild —
`uvicorn --reload` et `npm run dev` rechargent déjà le code modifié, vérifie juste que les deux
terminaux tournent toujours. Puis `/test TODO-2`. Claude relance tests et build, puis pilote le
navigateur via Playwright pour vérifier chaque critère.
**Vérification** : le verdict de `/test` est OK, ou ses échecs sont décrits attendu / observé.

## À retenir
Une command = un geste standardisé, contexte partagé. Cadrer → spécifier → implémenter → recetter :
le plan avant le code, et **toi** dans la boucle.
