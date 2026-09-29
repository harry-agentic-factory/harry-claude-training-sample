# Module 13 — MCP (Model Context Protocol)
Fiche : §13 · Profils : tous · Durée : ~15 min

## Concept
MCP = le standard pour brancher Claude sur des outils externes (navigateur, GitHub, Jira, DB…).
Un serveur expose des tools `mcp__<serveur>__<tool>`. Ici `.mcp.json` déclare `playwright` (pilote un
navigateur) et `github`. Portée : `.mcp.json` (projet, commité, partagé équipe) · `~/.claude.json`
(global) · `--mcp-config` (session, éphémère).

## Pas 1/1 — Piloter le navigateur en interactif
**Exercice (tous)** : l'app tourne. Tape le prompt de la fiche (adapte le port à ton mode — 8080 en
docker, 5173 en natif) :
> Ouvre http://localhost:8080, ajoute une tâche "Acheter du café", coche-la, puis clique le filtre "Actives" et vérifie qu'elle disparaît.

Observe les appels `mcp__playwright__browser_navigate` / `_type` / `_click` / `_snapshot`.
C'est exactement ce que l'agent tester (module 11) fait seul.
**Si ça bloque** : « tool not found » → `/mcp` pour l'état du serveur ; Node absent → module 00.
**Vérification** : Claude a conclu que la tâche a disparu de « Actives » (ou a décrit l'écart).

## À retenir
Interactif = tu es dans la boucle ; agent = la recette tourne seule. Mêmes tools MCP, pilotage
différent. Session = éphémère ; `.mcp.json` = persistant, partagé.
