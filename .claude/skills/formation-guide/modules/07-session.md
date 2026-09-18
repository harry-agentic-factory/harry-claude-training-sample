# Module 07 — Session : persistance & reprise
Fiche : §7 · Profils : tous · Durée : ~10 min

## Concept
Une session = une conversation sauvegardée (JSONL sous `~/.claude/projects/<projet>/`). On la reprend
avec `claude --continue` (la dernière) ou `claude --resume` (sélecteur). Reviennent : historique,
modèle, mode (sauf plan / bypass). Utile : `/context` (usage), `/compact` (résumer), `/export`.

## Pas 1/1 — Quitter et reprendre
**Exercice (tous)** : tape `/context` et regarde la jauge. Quitte Claude Code (`/exit`), relance dans
le même dossier :
```
claude --continue
```
Puis tape `/formation` : je dois te reconnaître et te proposer de reprendre **ici**
(c'est `.formation/progress.json` qui fait la mémoire, pas la conversation).
**Vérification** : à la reprise, je te salue par ton prénom et je te propose le module 07 : je le marque fait.

## À retenir
La conversation persiste, mais l'état d'un travail long doit vivre dans des **fichiers** : c'est ce qui
survit à `/compact`, à une nouvelle session, et à un sous-agent.
