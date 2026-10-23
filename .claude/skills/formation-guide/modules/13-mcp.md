# Module 13 — MCP
Fiche : §13 · Profils : tous · Durée : ~15 min

## Concept
**MCP** (Model Context Protocol) est le standard pour brancher Claude sur des outils externes : navigateur,
GitHub, Jira, base de données. Un serveur expose des tools nommés `mcp__<serveur>__<tool>`. Ici `.mcp.json`
déclare `playwright` (pilote un navigateur) et `github`. Ce fichier est commité : toute l'équipe a les mêmes
outils.

## Pas 1/1 — Piloter le navigateur
**Cas concret** : tu veux vérifier qu'un filtre marche vraiment dans l'interface, pas seulement dans le code.

**Exercice** : demande-moi de lancer l'app (cf. SKILL.md, « Lancer l'app à la demande ») et de te donner
l'adresse du front. Puis tape ce prompt, avec **cette** adresse :
> Ouvre <adresse du front>, ajoute une tâche "Acheter du café", coche-la, puis clique le filtre "Actives" et vérifie qu'elle disparaît.

Observe les appels `mcp__playwright__browser_navigate` / `_type` / `_click` / `_snapshot`.
C'est ce que l'agent `tester` (module 11) fait seul.
**Si ça bloque** : « tool not found » → tape `/mcp` pour voir l'état du serveur. Playwright déconnecté ?
Dis-le-moi : on lit alors `.mcp.json` ensemble et je t'explique ce que le tool aurait fait.

**Vérification** : Claude a conclu que la tâche a disparu de « Actives » (ou a décrit l'écart).

Fichier clé : `.mcp.json`.

## À retenir
Interactif : tu es dans la boucle. Agent : la recette tourne seule. Mêmes tools MCP. `.mcp.json` rend les
outils persistants et partagés.
