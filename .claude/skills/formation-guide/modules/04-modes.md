# Module 04 — Les modes
Fiche : §4 · Profils : tous (po : pas 1) · Durée : ~15 min (po ~10)

## Concept
Chaque action de Claude passe par un **mode de permission**. Les 3 à connaître : `default` (il demande avant
de modifier), `plan` (lecture seule : il propose un plan, ne touche à rien) et `acceptEdits` (les éditions
passent sans question). On change de mode avec **Shift+Tab**. Réflexe : tâche non triviale → `plan` d'abord.

## Pas 1/2 — Réfléchir sans risque (plan)
**Cas concret** : on te demande « ajoute une date d'échéance aux tâches ». Tu veux voir l'approche avant
qu'une seule ligne soit écrite.

**Exercice** : appuie sur Shift+Tab jusqu'à voir `plan` dans la barre. Puis :
> Propose un plan pour ajouter une date d'échéance aux tâches (back + front).

Lis le plan. Constate qu'**aucun fichier n'a changé**.

**Vérification** : `git status --short` est vide (hors `.formation/`) et tu as un plan sous les yeux.

## Pas 2/2 — Dérouler (acceptEdits) — dev / techlead
**Cas concret** : le plan te convient, tu veux enchaîner des petites éditions sans valider chacune.

**Exercice** : repasse en `default` (Shift+Tab) et demande :
> Ajoute un commentaire d'une ligne en tête de frontend/src/api.js : « Client API — formation ».

Observe la **demande de permission**, refuse. Passe en `acceptEdits`, redemande : l'édition passe sans
question. Annule ensuite : `git checkout -- frontend/src/api.js`.

**Vérification** : `git status --short` est de nouveau vide.

## À retenir
`plan` pour réfléchir, `default` au quotidien, `acceptEdits` pour dérouler un travail cadré.

## Question de contrôle (po)
Q : dans quel mode Claude ne peut rien modifier mais te propose une démarche ?
Attendu : plan.
