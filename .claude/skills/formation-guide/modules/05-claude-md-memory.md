# Module 05 — CLAUDE.md et memory
Fiche : §5 · Profils : tous · Durée : ~15 min

## Concept
Claude n'a aucune mémoire d'une session à l'autre. Deux fichiers y remédient. **`CLAUDE.md`** : écrit par **toi**, lu à
chaque session, partagé avec l'équipe (il est commité). Il reste court et sert d'**index** : comme une table des
matières, il renvoie vers les documents où se trouve l'information (`docs/`, que ce projet appelle son **brain**,
c'est-à-dire sa base de connaissances). **memory** : écrit par **Claude** pour
lui-même, il reste sur ta machine (`~/.claude/projects/<projet>/memory/`).

## Pas 1/2 — Mission : retrouve le contrat d'une API
<!-- tuteur : indices — 1) « L'information n'est pas dans CLAUDE.md : il dit seulement où la chercher. » 2) « Le contrat de l'API est décrit dans le dossier docs/. » 3) « C'est docs/technical.md ; dans CLAUDE.md, cherche la ligne qui le cite. » -->
**Cas concret** : un nouveau dev demande « quel est le contrat de PATCH /todos/{id} ? ». Personne ne s'en souvient : il
faut savoir où chercher.

**Exercice** : tape ce prompt dans la conversation :
> Quel est le contrat de l'endpoint PATCH /todos/{id} ? Dis-moi aussi quels fichiers tu as ouverts pour répondre.

Ouvre ensuite **toi-même** `CLAUDE.md` et repère la ligne qui renvoie vers le document que Claude a lu.

**Vérification** : tu me donnes le nom du document (`docs/…`) que Claude a ouvert.

## Pas 2/2 — La mémoire automatique
**Cas concret** : tu en as assez de répéter que tu préfères des réponses courtes.

**Exercice** : tape ce prompt dans la conversation :
> Retiens que je préfère des réponses courtes en français.

Claude écrit un fichier dans son dossier memory et l'indexe dans `MEMORY.md`.

**Vérification** : je liste moi-même `~/.claude/projects/*/memory/` : un nouveau `.md` doit exister.

Fichiers clés : `CLAUDE.md` (écrit par toi, partagé) et `MEMORY.md` (écrit par Claude, sur ta machine).

## À retenir
`CLAUDE.md` = ce que tu poses pour tout le monde, en index court. `memory` = ce que Claude retient pour toi, en local.
