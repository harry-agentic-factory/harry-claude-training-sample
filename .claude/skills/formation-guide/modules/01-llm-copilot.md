# Module 01 — Un LLM, un copilot
Fiche : §1 · Profils : tous · Durée : ~10 min

## Concept
Un **LLM** est un modèle qui génère du texte : il ne lit pas ton disque et n'exécute rien. **Claude Code**
est le programme local qui lui donne des **tools** (Read, Edit, Bash…) et une boucle : réfléchir → appeler
un tool → lire le résultat → recommencer. Le LLM pense, Claude Code agit.

## Pas 1/1 — Voir la boucle à l'œuvre
**Cas concret** : tu dois comprendre une fonction d'un projet que tu n'as jamais ouvert. Tu ne lis pas le
code toi-même : tu poses la question et tu regardes ce que Claude fait pour y répondre.

**Exercice** : tape ce prompt dans la conversation :
> Explique-moi ce que fait l'endpoint de création de tâche, et dis-moi quels tools tu as utilisés pour répondre.

Observe : Claude appelle `Read` (voire `Grep`) sur `backend/app/routers/todos.py` **avant** de répondre.
Il ne le « savait » pas : il est allé lire.

**Vérification** : tu me nommes au moins un tool appelé (Read / Grep), visible dans la conversation. Puis
tu réponds à la question de contrôle.

Fichier à ouvrir pour comparer avec sa réponse : `backend/app/routers/todos.py`.

## À retenir
Claude Code = LLM + tools + boucle + permissions. Ce qu'il n'a pas lu, il ne le sait pas.

## Question de contrôle
Q : quelle est la différence entre « le LLM » et « Claude Code » ?
Attendu : le LLM est le modèle distant qui génère ; Claude Code est le programme local qui tient la
conversation, expose les tools, applique les permissions et parle au LLM.
