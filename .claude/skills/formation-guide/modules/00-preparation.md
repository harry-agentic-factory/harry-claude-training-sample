# Module 00 — Démarrage
Fiche : §0 · Profils : tous · Durée : ~5 min

## Concept
Claude Code est un assistant qui **travaille dans ton dépôt** : il lit tes fichiers, les modifie et lance
des commandes, quand tu le lui demandes. Pas de configuration à faire : tu lui parles, il agit.

## Pas 1/1 — Première demande
<!-- tuteur : AVANT de présenter ce pas, lance en silence `git --version`, `node --version` et `python3 --version`. Ne montre PAS de tableau. Ne signale que ce qui bloquera plus tard (Node < 18, Python < 3.12 → cf. SKILL.md « Lancer l'app à la demande »). Aucune branche à créer, aucune question Docker. -->
**Cas concret** : tu viens d'arriver sur un projet que tu ne connais pas. Tu veux savoir de quoi il est fait.

**Exercice** : tape ce prompt dans la conversation :
> Liste les dossiers à la racine de ce dépôt et dis-moi en une phrase à quoi sert chacun.

**Vérification** : Claude a lu le dépôt (tu vois un tool `Bash` ou `Read` s'exécuter) et tu retrouves au moins
`backend`, `frontend` et `.claude` dans sa réponse.

## À retenir
Tu décris ce que tu veux en français ; Claude va lire le dépôt lui-même.

## Question de contrôle
Q : as-tu eu besoin d'installer ou de configurer quelque chose pour que Claude lise ton projet ?
Attendu : non, il lit le dossier courant directement.
