# Module 04 — Les modes de l'agent
Fiche : §4 · Profils : tous (po : pas 1) · Durée : ~15 min (po ~10)

## Concept
Chaque action passe par un **mode de permission** : `default` (demande tout sauf les lectures),
`acceptEdits` (éditions auto), `plan` (lecture seule, produit un plan), `auto`, `dontAsk`,
`bypassPermissions` (jamais hors bac à sable). On cycle avec **Shift+Tab**.
Réflexe : tâche non triviale → `plan` d'abord.

## Pas 1/2 — Réfléchir sans risque (mode plan)
**Exercice (tous)** : appuie sur Shift+Tab jusqu'à voir `plan` dans la barre. Puis :
> Propose un plan pour ajouter une date d'échéance aux tâches (back + front).

Lis le plan. Constate : **aucun fichier n'a été modifié**.
**Vérification** : je vérifie que `git status --short` est vide (hors `.formation/`) et que tu as un plan sous les yeux.

## Pas 2/2 — Dérouler (acceptEdits) — dev / techlead (po : passe)
**Exercice** : repasse en `default` (Shift+Tab). Demande :
> Ajoute un commentaire d'une ligne en tête de frontend/src/api.js : « Client API — formation ».

Observe la **demande de permission** avant l'édition. Refuse. Passe en `acceptEdits`, redemande :
l'édition passe sans question. Puis annule : `git checkout -- frontend/src/api.js`.
**Vérification** : je vérifie que `git status --short` est de nouveau vide.

## À retenir
`plan` pour réfléchir, `default` au quotidien, `acceptEdits` pour dérouler une série d'éditions cadrées,
`bypassPermissions` jamais hors conteneur.

## Question de contrôle (po)
Q : dans quel mode Claude ne peut rien modifier mais te propose une démarche ?
Attendu : plan.
