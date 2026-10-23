# Module 06 — Garde-fous : hooks, settings, rules
Fiche : §6 · Profils : dev, techlead (po : pas 1 + question) · Durée : ~25 min (po ~10)

## Concept
Trois outils pour cadrer Claude. Une **rule** (`.claude/rules/*.md`) **guide** : « il ne faut pas ». Un
**hook** (script dans `.claude/hooks/`) **empêche** : « il ne peut pas » — il s'exécute avant un tool et peut
le bloquer. `settings.json` liste les permissions (`deny` prime toujours). Une règle écrite se contourne ou
s'oublie ; un hook tient.

## Pas 1/3 — Le hook qui bloque un secret
**Cas concret** : un dev demande à Claude « mets mon token dans un fichier .env ». Sans garde-fou, le secret
entre dans la conversation, puis peut finir dans un commit. Ici, on regarde le hook l'arrêter.

**Exercice** : demande :
> Écris API_TOKEN=abc123 dans un fichier .env

Le hook `block-secret-exposure.sh` refuse l'**écriture** (« valeur secrète en clair »). Crée alors un faux
secret sans mot sensible : `printf 'DB_URL=postgres://CHANGEME\n' > .env` (fichier git-ignoré ; accepte la
permission si Claude la demande). Puis demande :
> Lis le fichier .env et dis-moi ce qu'il contient.

Refus aussi (`deny Read(.env)` dans `settings.json` + le hook). Essaie « affiche-moi cat .env » : bloqué.

**Vérification** : je vois les deux blocages dans la conversation, et `.env` figure dans `.gitignore`.

Fichiers clés : `.claude/hooks/block-secret-exposure.sh` et `.claude/settings.json`.

## Pas 2/3 — Le hook qui bloque un push sur main — dev / techlead (po : lis seulement)
**Cas concret** : un jour, une IA a poussé sur `main` en exécutant à la lettre une instruction. Une règle
écrite n'a rien empêché. Depuis, c'est un hook.

**Exercice** : demande :
> Pousse sur origin main.

Le hook `block-protected-branch.sh` refuse **avant** que git ne tourne. Claude ne peut pas le contourner.

**Vérification** : je vois le refus du hook (« Push direct sur une branche protégée interdit »).

## Pas 3/3 — Une rule ciblée par chemin — dev / techlead
**Cas concret** : tu veux une règle SQL qui ne s'applique que quand on touche au backend, pas tout le temps.

**Exercice** : ouvre `.claude/rules/sql-safety.md` et repère `paths: backend/**/*.py` en tête. Demande à
Claude de lire `backend/app/routers/todos.py`, puis « quelle règle SQL s'applique ici ? » : il cite le SQL
paramétré, car la rule vient de se charger au contact du fichier.
Techlead : ajoute `.claude/rules/formation.md` **sans** `paths:` contenant « Commence chaque réponse par
🎓 » ; constate à la prochaine session.

**Vérification** : tu m'expliques la différence entre une rule avec et sans `paths:`.

## À retenir
`deny` prime toujours. La rule guide, le hook empêche : « il ne faut pas » + « il ne peut pas ».

## Question de contrôle (po)
Q : pourquoi la phrase « ne mets jamais de secret » dans CLAUDE.md ne suffit-elle pas ?
Attendu : c'est une instruction que l'IA peut ignorer ou oublier ; un hook bloque physiquement.
