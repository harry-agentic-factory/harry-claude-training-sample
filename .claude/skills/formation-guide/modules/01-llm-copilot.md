# Module 01 — Un LLM, un copilot
Fiche : §1 · Profils : tous · Durée : ~10 min

## Concept
Un **LLM** est un modèle qui génère du texte : il ne lit pas ton disque et n'exécute rien. **Claude Code** est le
programme local qui lui donne des **tools** (des outils : lire un fichier, le modifier, lancer une commande…) et une
boucle : réfléchir → appeler un outil → lire le résultat → recommencer. Le LLM pense, Claude Code agit.

## Pas 1/1 — Mission : retrouve le code
<!-- tuteur : indices — 1) « Pour répondre, Claude doit-il deviner ou aller regarder ? » 2) « Le code de l'API est dans `backend/app/routers/`. » 3) « C'est `backend/app/routers/todos.py` ; cherche le mot `INSERT`. » -->
**Cas concret** : tu dois modifier la création d'une tâche dans un projet que tu n'as jamais ouvert. Avant de coder,
tu cherches où ça se passe.

**Avant de lancer** : fais un pari. Claude connaît-il déjà ce code, ou va-t-il devoir aller le lire ? Tu me diras au
`suivant` si tu avais raison.

**Exercice** : tape ce prompt dans la conversation :
> Où est défini l'endpoint de création de tâche, et que fait-il ? Dis-moi aussi quels outils tu as utilisés pour répondre.

Ouvre ensuite **toi-même** le fichier qu'il t'indique et retrouve la ligne qui insère la tâche en base (cherche `INSERT`).

**Vérification** : tu me donnes (1) le chemin du fichier, (2) un outil que Claude a utilisé (`Read` ou `Grep`, visible
dans la conversation), (3) ton pari de départ : avais-tu raison ?

## À retenir
Claude Code = LLM + outils + boucle + permissions. Ce qu'il n'a pas lu, il ne le sait pas.

## Question de contrôle
Q : quelle est la différence entre « le LLM » et « Claude Code » ?
Attendu : le LLM est le modèle distant qui génère ; Claude Code est le programme local qui tient la
conversation, expose les outils, applique les permissions et parle au LLM.
