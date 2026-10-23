# Module 11 — Les agents
Fiche : §11 · Profils : tous (po : pas 1) · Durée : ~15 min (po ~10)

## Concept
Un **agent** est un assistant spécialisé, défini dans `.claude/agents/<nom>.md`. Il travaille dans **sa**
conversation, avec **ses** droits (le `reviewer` ne peut que lire : `tools: Read, Grep, Glob`), puis te
renvoie un verdict. Différence avec une command : une command est un prompt que **toi** tu lances dans ta
conversation ; un agent travaille **à part**, avec ses propres droits, et te rend seulement un verdict.

## Pas 1/2 — Déléguer une revue ou une recette
**Cas concret** : tu as fini une feature. Avant la PR, tu veux un regard neuf qui compare le code aux
invariants de la spec, sans que ta conversation en soit polluée.

**Exercice (po)** : demande-moi de lancer l'app (cf. SKILL.md), puis tape :
> Lance l'agent tester sur TODO-1 (le filtre des tâches).

L'agent lit `docs/features/filtre-taches.md`, pilote le navigateur et renvoie `{ pass, echecs }`. Si
Playwright n'est pas connecté, il le dit : lance plutôt l'agent reviewer sur `docs/features/filtre-taches.md`.
**Exercice (dev / techlead)** :
> Liste les fichiers modifiés par mon dernier commit, puis lance l'agent reviewer sur ces fichiers avec les invariants de docs/features/<slug>.md.

(Le reviewer ne peut pas lancer `git` : il n'a que les outils de lecture. C'est donc Claude qui lui donne la liste des
fichiers à relire.)

Lis le verdict `{ conforme, ecarts[] }`. Des écarts ? Corrige et relance.

**Vérification** : un verdict structuré est revenu dans la conversation.

Fichier clé : `.claude/agents/reviewer.md`.

## Pas 2/2 — Le deployer et son mode — dev / techlead
**Cas concret** : le même agent doit déployer en local (sur ta machine) ou en remote (sur le serveur de l'équipe,
hors périmètre de cette formation). Il ne doit jamais deviner lequel.

**Exercice** : ouvre `.claude/agents/deployer.md` et la skill `docker-deploy` ou `local-deploy`. Demande-moi
de t'expliquer en 3 lignes comment le **mode** (`local` / `remote`) est donné à l'appel et ce qui se passe
s'il manque. Ce pas se fait **en lecture** : aucun Docker n'est nécessaire. Si tu as Docker et que tu veux
l'exécuter, tape « Lance l'agent deployer en mode local ».

**Vérification** : tu me dis que l'agent doit **demander** le mode s'il n'est pas précisé.

Fichier clé : `.claude/agents/deployer.md`.

## À retenir
Agent = qui + droits + contexte neuf + verdict. L'état partagé passe par des fichiers, jamais par la
conversation.

## Question de contrôle (po)
Q : pourquoi le reviewer n'a-t-il que Read / Grep / Glob ?
Attendu : lecture seule = il ne peut rien casser ; son jugement n'est pas pollué par la conversation.
