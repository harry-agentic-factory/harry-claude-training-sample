# Module 10 — Les commands (slash commands)
Fiche : §10 · Profils : tous (po : pas 1-2 · dev / techlead : pas 1-4) · Durée : dev ~40 min · po ~25 min

## Concept
Une **command** est un fichier `.claude/commands/<nom>.md` : un prompt réutilisable (avec `$ARGUMENTS`) que tu
lances en tapant `/<nom>`. Elle s'exécute **dans ta conversation**. Le cycle du repo : `/scope` (cadrer) →
`/spec` (critères, plan, invariants) → `/implement` (coder) → `/test` (recetter). `/formation` en est une aussi.

## Pas 1/4 — Cadrer une idée (/scope)
**Cas concret** : un client dit « je voudrais une échéance sur les tâches ». Avant de coder, on écrit ce qu'on
va faire, et ce qu'on ne fait pas.

**Exercice (po)** : choisis une idée métier pour l'app todo (ex. « rappel par email la veille de l'échéance »)
et tape `/scope <ton idée>`. Corrige le mini-PRD à la voix si le périmètre n'est pas le tien.
**Exercice (dev / techlead)** : tape :
```
/scope ajouter une date d'échéance aux tâches
```

**Vérification** : un nouveau fichier existe dans `docs/features/` (`git status --short`).

Fichier clé : `.claude/commands/scope.md` (le prompt que tu viens de lancer).

## Pas 2/4 — Spécifier (/spec)
**Cas concret** : « ajoute une échéance » est flou. Quels critères d'acceptation ? Quels invariants à ne pas
casser ?

**Exercice** : prends la première story de ton PRD et tape, dans le **même** fichier :
```
/spec <story 1 de ton PRD> — dans docs/features/<slug>.md
```
(dev : `/spec TODO-2 champ dueDate + tri par échéance — dans docs/features/<slug>.md`). Lis les 3 blocs :
critères Given / When / Then, plan back / front, **invariants** (la checklist du reviewer, module 11).
po : modifie les critères à la voix.

**Vérification** : un fichier de `docs/features/` contient une section critères **et** une section
invariants.

## Pas 3/4 — Implémenter (/implement) — dev / techlead
**Cas concret** : la spec est validée, on code, avec des tests à chaque étape.

**Exercice** : tape `/implement`. Claude déroule le plan, lance les tests et `npm run build` à chaque
étape, et fait un commit par étape. **Reste dans la boucle** : lis chaque diff avant d'accepter.

**Vérification** : `git log --oneline -5` montre au moins un commit en Conventional Commits, et
`pytest -q` passe dans `backend/` (avec le venv).

## Pas 4/4 — Recetter (/test) — dev / techlead
**Cas concret** : « ça marche chez moi » ne suffit pas. On rejoue les critères sur l'app qui tourne.

**Exercice** : demande-moi de lancer l'app (cf. SKILL.md, « Lancer l'app à la demande »), puis tape
`/test TODO-2`. Claude relance tests et build, puis pilote le navigateur pour vérifier chaque critère.
Si le serveur MCP Playwright n'est pas connecté, `/test` le dit : dans ce cas, vérifie les critères à la
main dans ton navigateur et dis-moi le résultat.

**Vérification** : le verdict de `/test` est OK, ou ses échecs sont décrits attendu / observé.

## À retenir
Une command = un geste standardisé. Cadrer → spécifier → implémenter → recetter : le plan avant le code, et
**toi** dans la boucle.
