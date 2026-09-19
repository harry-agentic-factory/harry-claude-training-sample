# Module 11 — Agents (sous-agents)
Fiche : §11 · Profils : tous (po : pas 1) · Durée : ~15 min (po ~10)

## Concept
Un agent = un worker au **contexte isolé** (sa fenêtre, ses tools, son modèle), défini dans
`.claude/agents/<nom>.md`. Il repart de zéro et ne renvoie qu'un verdict. Command = un geste dans
**ta** conversation ; agent = une mission déléguée avec **ses propres droits** (le reviewer ne peut
rien modifier : `tools: Read, Grep, Glob`). Un agent ne peut pas appeler une slash command ; il peut
appeler un outil MCP.

## Pas 1/2 — Déléguer une recette / une revue
**Exercice (po)** : l'app tourne (module 00). Tape :
> Lance l'agent tester sur TODO-1 (le filtre des tâches).

Regarde : l'agent lit `docs/features/filtre-taches.md`, pilote le navigateur, rejoue, renvoie
`{ pass, echecs }`. Toi, tu n'as rien fait — et ta conversation reste propre.
**Exercice (dev / techlead)** :
> Lance l'agent reviewer sur le diff de ma branche par rapport à main, avec les invariants de docs/features/<slug>.md.

Lis le verdict `{ conforme, ecarts[] }`. Des écarts ? Corrige (ou fais corriger) et relance.
**Vérification** : un verdict structuré est revenu dans la conversation.

## Pas 2/2 — Le deployer et son mode — dev / techlead
<!-- tuteur : ce pas exerce spécifiquement docker compose (agent deployer, Docker-only par design). Mode natif : dis-le avant de lancer l'exercice, propose l'alternative ci-dessous plutôt que de bloquer sur un échec. -->
**Mode natif (sans Docker)** : cet agent build des images et pilote `docker compose` — impossible à
exécuter sans Docker, quel que soit ton mode par ailleurs. Deux options : installer Docker juste pour
ce pas (`docker --version` puis on relance), ou lire `.claude/agents/deployer.md` et la skill
`local-deploy` avec moi (je les résume) sans les exécuter — je note ce pas en `sautes` avec la
raison. **À toi de choisir.**

**Exercice (mode docker)** : ouvre `.claude/agents/deployer.md` : le mode (`local` / `remote`) est
donné **à l'appel** et choisit la skill. Tape :
> Lance l'agent deployer en mode local.

Il rebuild, relance, vérifie `docker compose ps` (healthy) et renvoie `{ mode, ok, tag, url }`.
Réessaie **sans** préciser le mode : il doit **demander**, pas deviner.
**Vérification** : je lance `docker compose ps` (healthy), et tu me confirmes que l'agent a demandé le mode.

## À retenir
Agent = qui + droits, contexte neuf, verdict. L'état partagé passe par des fichiers (`docs/…`) ou le
MCP, jamais par « la conversation ».

## Question de contrôle (po)
Q : pourquoi le reviewer n'a-t-il que Read / Grep / Glob ?
Attendu : lecture seule = il ne peut rien casser ; et son jugement n'est pas pollué par la
conversation principale.
