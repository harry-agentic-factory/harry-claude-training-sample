# Module 09 — Le brain : donner une mémoire au projet
Fiche : §9 · Profils : tous (techlead : pas 2) · Durée : ~10 min (techlead ~20)

## Concept
Le **brain** est la connaissance du projet écrite dans des fichiers que Claude sait retrouver. Trois façons :
dans le repo (`docs/` + rules, versionné avec le code : le cas ici), dans un repo à part monté via
`additionalDirectories` (multi-repo), ou derrière un serveur MCP. Dans tous les cas, `CLAUDE.md` reste un
index court.

## Pas 1/2 — Le brain répond
**Cas concret** : un nouveau dev arrive et demande « comment on fait un rollback chez nous ? ». Il veut la
procédure du projet, pas une réponse générique.

**Exercice** : demande :
> Comment on fait un rollback en déploiement local ?

Observe : Claude lit `docs/ci-cd.md` (ou la skill `local-deploy`) et répond avec **la procédure du repo**.

**Vérification** : un `Read` de `docs/ci-cd.md` ou de `.claude/skills/local-deploy/SKILL.md` est visible.

Fichier clé : `docs/ci-cd.md`.

## Pas 2/2 — Enrichir le brain — techlead (dev : optionnel)
**Cas concret** : tu découvres une limite du projet que personne n'a notée. Tu l'écris une fois, tout le
monde en profite.

**Exercice** : ajoute à `docs/technical.md` une section « Limites connues » avec une phrase (ex. « SQLite
mono-fichier : pas de concurrence d'écriture »). Demande : « Quelles sont les limites connues de la base ? ».

**Vérification** : `git diff --stat` montre `docs/technical.md`, et Claude a cité ta phrase.

## À retenir
Mono-repo : brain dans `docs/`, indexé par CLAUDE.md. Multi-repo : brain à part, monté.

## Question de contrôle (po)
Q : à quoi sert `additionalDirectories` ?
Attendu : donner accès à un autre dossier (ex. un brain partagé) depuis la session.
