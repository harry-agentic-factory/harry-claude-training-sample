# Module 05 — CLAUDE.md et memory
Fiche : §5 · Profils : tous · Durée : ~15 min

## Concept
Claude n'a aucune mémoire d'une session à l'autre. Deux fichiers y remédient. **`CLAUDE.md`** : ce que **toi**
tu écris, lu à chaque session ; il reste court et sert d'**index** vers `docs/`. **memory** : ce que
**Claude** retient seul (préférences, leçons), dans `~/.claude/projects/<projet>/memory/`.

## Pas 1/2 — L'index qui délègue
**Cas concret** : un nouveau dev demande « quel est le contrat de PATCH /todos/{id} ? ». La réponse n'est pas
dans `CLAUDE.md` : celui-ci dit seulement où la trouver.

**Exercice** : demande « montre-moi CLAUDE.md », puis :
> Quel est le contrat de l'endpoint PATCH /todos/{id} ?

Observe : Claude va lire `docs/technical.md`, parce que l'index lui a donné le chemin.

**Vérification** : un `Read` de `docs/technical.md` est visible dans la conversation.

## Pas 2/2 — La mémoire automatique
**Cas concret** : tu en as assez de répéter que tu préfères des réponses courtes.

**Exercice** : demande :
> Retiens que je suis <ton prénom>, <ton profil>, et que je préfère des réponses courtes en français.

Claude écrit un fichier dans son dossier memory et l'indexe dans `MEMORY.md`.

**Vérification** : je liste `~/.claude/projects/*/memory/` : un nouveau `.md` doit exister.

Fichiers clés : `CLAUDE.md` (toi) et `MEMORY.md` (Claude).

## À retenir
CLAUDE.md = ce que tu poses, en index court. memory = ce que l'assistant retient.
