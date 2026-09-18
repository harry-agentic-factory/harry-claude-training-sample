# Module 01 — Un LLM, un « copilot de coding »
Fiche : §1 · Profils : tous · Durée : ~10 min

## Concept
Un LLM prédit du texte : il ne lit pas ton disque, n'exécute rien, n'a aucune mémoire entre deux appels.
Claude Code (le CLI) ajoute la couche agentique : des **tools** (Read, Edit, Bash…) que le modèle décide
d'appeler, une **boucle** (réfléchir → tool → résultat → recommencer) et des **permissions**.
Le LLM pense, le harness agit.

## Pas 1/1 — Voir la boucle à l'œuvre
**Exercice (tous)** : tape ce prompt :
> Explique-moi ce que fait l'endpoint de création de tâche, et dis-moi quels tools tu as utilisés pour répondre.

Observe : Claude appelle `Read` (voire `Grep`) sur `backend/app/routers/todos.py` **avant** de répondre.
Il ne « savait » pas : il est allé lire.
**Vérification** : tu me nommes au moins un tool que Claude a appelé (Read / Grep) — il est visible dans la conversation.

## À retenir
Copilot de coding = LLM + tools + boucle agentique + permissions. Ce qu'il n'a pas lu, il ne le sait pas.

## Question de contrôle
Q : quelle est la différence entre « le LLM » et « le CLI Claude Code » ?
Attendu : le LLM est le modèle distant qui génère ; le CLI est le programme local qui tient la
conversation, expose les tools, applique les permissions et parle au LLM.
