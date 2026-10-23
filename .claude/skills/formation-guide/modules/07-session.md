# Module 07 — Session : quitter et reprendre
Fiche : §7 · Profils : tous · Durée : ~10 min

## Concept
Une **session** est une conversation sauvegardée. On la reprend avec `claude --continue` (la dernière) ou
`claude --resume` (au choix). `/context` montre le remplissage de la conversation, `/compact` la résume.
Ce qui doit survivre longtemps vit dans des **fichiers**, pas dans la conversation.

## Pas 1/1 — Quitter et reprendre
**Cas concret** : tu t'arrêtes en milieu de journée et tu reviens après le déjeuner, ou le lendemain.

**Exercice** : tape `/context` et regarde la jauge. Quitte avec `/exit`, puis relance dans le même dossier :
```
claude --continue
```
Tape ensuite `/formation` : je dois te reconnaître et te proposer de reprendre **ici**.

**Vérification** : à la reprise, je te salue par ton prénom et je te propose le module 07, que je marque fait.

Fichier clé : `.formation/progress.json` (c'est lui qui retient ta place, pas la conversation).

## À retenir
La conversation persiste, mais l'état d'un travail long doit être écrit dans un fichier.
