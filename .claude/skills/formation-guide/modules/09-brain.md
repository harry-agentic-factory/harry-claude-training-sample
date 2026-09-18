# Module 09 — Donner une mémoire au projet : 3 stratégies
Fiche : §9 · Profils : tous (techlead : pas 2) · Durée : ~10 min (techlead ~20)

## Concept
Trois façons d'externaliser la connaissance : **brain dans le repo** (`docs/` + rules, versionné avec le
code — le cas ici), **brain décentralisé** (un repo à part monté via `additionalDirectories`, pour le
multi-repo), **brain via MCP** (requêtable par la session **et** les sous-agents).
Dans tous les cas `CLAUDE.md` reste un index, pas une encyclopédie.

## Pas 1/2 — Le brain répond
**Exercice (tous)** :
> Comment on fait un rollback en déploiement local ?

Observe : Claude lit `docs/ci-cd.md` (ou la skill `local-deploy`) et répond avec **la procédure du
repo**, pas une réponse générique.
**Vérification** : un `Read` de `docs/ci-cd.md` ou de `.claude/skills/local-deploy/SKILL.md` est apparu dans la conversation.

## Pas 2/2 — Enrichir le brain — techlead (dev : optionnel)
**Exercice** : ajoute à `docs/technical.md` une section « Limites connues » avec une phrase
(ex. « SQLite mono-fichier : pas de concurrence d'écriture »). Demande : « Quelles sont les limites
connues de la base ? » → Claude cite ta phrase.
**Vérification** : `git diff --stat` montre `docs/technical.md`, et Claude a cité ton contenu.

## À retenir
Mono-repo → brain dans `docs/`, indexé par CLAUDE.md. Multi-repo → brain à part, monté.
Un brain vivant = un dev opérationnel en heures au lieu de semaines.

## Question de contrôle (po)
Q : à quoi sert `additionalDirectories` ?
Attendu : donner accès à un autre dossier / repo (ex. un brain partagé) depuis la session.
