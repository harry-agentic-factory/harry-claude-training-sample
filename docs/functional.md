# Brain — Présentation fonctionnelle

## Le quoi

Une petite application de **gestion de tâches (todo)** : lister, créer, cocher (terminé),
supprimer, et **filtrer** par état (Toutes / Actives / Terminées).

## Le pourquoi

Le vrai objectif n'est **pas** l'app — c'est de servir de **bac à sable de formation Claude Code**.
L'app est volontairement minimale pour que l'attention porte sur le **harness** (`.claude/`) : commands,
agents, skills, hooks, MCP, et le cycle de dev structuré. Voir [`../README.md`](../README.md).

## Le qui

- **Public** : développeurs Harington qui découvrent Claude Code (fiche « Prise en main de Claude »).
- **Rôles dans le flux** : un humain pilote (Harry-like) ; des agents autonomes exécutent (reviewer,
  tester, deployer).

## Parcours utilisateur (app)

1. J'ouvre l'app → je vois mes tâches.
2. Je tape un intitulé + « Ajouter » → la tâche apparaît (persistée côté API).
3. Je coche une tâche → elle passe « terminée ».
4. Je clique un filtre (**Toutes / Actives / Terminées**) → la liste se recharge filtrée via l'API.
5. Je supprime une tâche (✕) → elle disparaît.

## Critères d'acceptation de référence

Voir la feature d'exemple : [`features/filtre-taches.md`](features/filtre-taches.md)
(produite par `/scope` puis `/spec`).

## Périmètre

- **Inclus** : CRUD todo + filtre par état.
- **Exclu** (volontairement) : authentification, multi-utilisateur, recherche texte, pagination, tri.
  Ce sont de bons exercices à ajouter via le cycle `/scope → /spec → /implement`.
