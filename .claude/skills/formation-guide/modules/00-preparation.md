# Module 00 — Démarrage
Fiche : §0 · Profils : tous · Durée : ~5 min

## Concept
Claude Code est un assistant qui **travaille dans ton dépôt** (le dossier de ton projet, suivi par Git). Il lit tes
fichiers, les modifie et lance des commandes quand tu le lui demandes. Pas de configuration : tu lui parles, il agit.

## Pas 1/1 — Première demande
<!-- tuteur : n'affiche AUCUN avertissement d'environnement ici (ni Python, ni OS, ni extension). Lance en silence `git --version`, `node --version`, `python3 --version` ; ne dis rien, sauf si git manque (bloquant). Python et Node se règlent au module 10 via tools/setup.sh. Aucune branche, aucune question Docker.
indices : 1) « Tu n'as rien à configurer : décris simplement ce que tu veux savoir. » 2) « Demande-lui de lister les dossiers du projet. » 3) Donne le prompt de l'exercice. -->
**Cas concret** : tu viens d'arriver sur un projet que tu ne connais pas. Tu veux savoir de quoi il est fait.

**Exercice** : tape ce prompt dans la conversation :
> Liste les dossiers à la racine de ce dépôt et dis-moi en une phrase simple, sans jargon, à quoi sert chacun.

**Vérification** : tu vois Claude lire ton dossier. Une ligne du type `Bash` ou `Read` apparaît : ce sont ses
**outils**, c'est-à-dire les actions qu'il sait faire (lire un fichier, lancer une commande). Sa réponse cite au moins
`backend`, `frontend` et `.claude`.

## À retenir
Tu décris ce que tu veux en français ; Claude va lire le dépôt lui-même.
