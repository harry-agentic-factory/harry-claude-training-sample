# Module 05 — CLAUDE.md & memory
Fiche : §5 · Profils : tous · Durée : ~15 min

## Concept
`CLAUDE.md` = la mémoire projet que **tu** écris, lue à chaque session. Court : un **index** qui renvoie
au brain `docs/` et aux rules. `memory` = ce que **Claude** retient seul (leçons, préférences) dans
`~/.claude/projects/<projet>/memory/`. Vital : le LLM n'a aucune mémoire entre sessions, et son
contexte se compacte quand il sature.

## Pas 1/2 — L'index qui délègue
**Exercice (tous)** : fais-toi lire `CLAUDE.md` par Claude (« montre-moi CLAUDE.md »). Puis :
> Quel est le contrat de l'endpoint PATCH /todos/{id} ?

Observe : Claude va lire `docs/technical.md` — l'index lui a donné le chemin, sans que le contrat
soit dans `CLAUDE.md`.
**Vérification** : un `Read` de `docs/technical.md` est apparu dans la conversation.

## Pas 2/2 — La mémoire automatique
**Exercice (tous)** :
> Retiens que je suis <prénom>, <profil>, et que je préfère des réponses courtes en français.

Claude écrit un fichier dans son dossier memory et l'indexe dans `MEMORY.md`.
**Vérification** : je liste `~/.claude/projects/*/memory/` : un nouveau `.md` doit exister
(le sous-dossier exact dépend du chemin du repo).

## À retenir
CLAUDE.md = ce que tu poses (index court). memory = ce que l'assistant retient.
Sans mémoire externalisée, on ré-explique tout, sans cesse.
