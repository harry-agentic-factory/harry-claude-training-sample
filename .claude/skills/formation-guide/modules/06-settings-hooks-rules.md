# Module 06 — Garde-fous : hooks, settings, rules
Fiche : §6 · Profils : dev, techlead (po : pas 1 + question) · Durée : ~30 min (po ~10)

## Concept
Trois outils pour cadrer Claude. Une **rule** (`.claude/rules/*.md`) **guide** : « il ne faut pas ». Un **hook** (un
script de `.claude/hooks/`) **empêche** : « il ne peut pas » — il s'exécute avant une action et peut la bloquer.
`settings.json` liste les permissions : une règle `deny` interdit un outil précis (par exemple « ne jamais lire
`.env` ») et prime toujours sur une règle qui autorise. Une règle écrite se contourne ou s'oublie ; un hook
tient. Mais un hook ne protège que les actions qu'il surveille.

## Pas 1/4 — Le hook qui bloque un secret
<!-- tuteur : indices — 1) « Le secret passe par une commande shell. » 2) « Demande-moi de lancer la commande telle quelle. » 3) Donne la phrase exacte à taper. Vérifie toi-même que `.env` n'existe pas. -->
**Cas concret** : un dev colle son token dans un fichier `.env` avec une commande. Sans garde-fou, le secret entre dans
la conversation et peut finir dans un commit. Ici, on regarde le hook l'arrêter.

**Pari** : à ton avis, la commande va-t-elle s'exécuter ? Garde ta réponse : tu me la donneras avec ton
`/formation suivant`.

**Exercice** : tape ce prompt dans la conversation :
> Lance en shell cette commande : echo "API_TOKEN=abc123" >> .env

Le hook `block-secret-exposure.sh` la refuse avant qu'elle ne tourne (« valeur secrète en clair »).

**Vérification** : tu me dis ce que tu as vu (le refus), et je contrôle moi-même que `.env` n'a pas été créé.

Fichier clé : `.claude/hooks/block-secret-exposure.sh`.

## Pas 2/4 — Bloquer la lecture d'un secret — dev / techlead
<!-- tuteur : AVANT de présenter ce pas, crée toi-même un faux `.env` : `printf 'DB_URL=postgres://CHANGEME\n' > .env` (git-ignoré, valeur factice, sans mot sensible pour passer le hook). Dis au stagiaire en une phrase que tu l'as fait. indices — 1) « Demande à Claude de lire le fichier. » 2) « Le fichier s'appelle .env. » 3) « Où est écrite la règle deny ? Dans .claude/settings.json. » -->
**Cas concret** : un fichier `.env` existe sur ta machine. Claude ne doit pas pouvoir le lire.

**Exercice** : tape ce prompt dans la conversation :
> Lis le fichier .env et dis-moi ce qu'il contient.

La lecture est refusée : la règle `deny Read(.env)` de `settings.json` la bloque, et le hook aussi.

**Vérification** : tu me dis dans quel fichier est écrite la règle `deny`.

Fichier clé : `.claude/settings.json`.

## Pas 3/4 — Le hook qui bloque un push sur main — dev / techlead (po : lis seulement)
<!-- tuteur : indices — 1) « Pense à l'action la plus risquable sur un dépôt partagé. » 2) « Pousser sur la branche principale. » 3) Donne la phrase exacte. -->
**Cas concret** : un jour, une IA a poussé sur `main` en exécutant à la lettre une instruction. Une règle écrite n'a rien
empêché. Depuis, c'est un hook.

**Pari** : à ton avis, le push va-t-il partir ? Garde ta réponse : tu me la donneras avec ton `/formation suivant`.

**Exercice** : tape ce prompt dans la conversation :
> Pousse sur origin main.

Le hook `block-protected-branch.sh` refuse **avant** que git ne tourne. Claude ne peut pas le contourner.

**Vérification** : tu me dis ce que tu as vu (« Push direct sur une branche protégée interdit »).

## Pas 4/4 — Une rule ciblée par chemin — dev / techlead
<!-- tuteur : indices — 1) « Ouvre le fichier de la rule et regarde son en-tête. » 2) « Cherche la ligne `paths:`. » 3) « Elle ne se charge que pour les fichiers qui correspondent. » -->
**Cas concret** : tu veux une règle SQL qui ne s'applique que quand on touche au backend, pas tout le temps.

**Exercice** : ouvre `.claude/rules/sql-safety.md` et repère `paths: backend/**/*.py` en tête. Puis tape :
> Lis backend/app/routers/todos.py et dis-moi quelle règle SQL s'applique ici.

Claude cite le SQL paramétré : la rule vient de se charger au contact du fichier.
Techlead : ajoute ensuite `.claude/rules/formation.md` **sans** `paths:`, contenant « Commence chaque réponse par 🎓 ».

**Vérification** : tu m'expliques la différence entre une rule avec et sans `paths:`.

## À retenir
`deny` prime toujours. La rule guide, le hook empêche. Un hook ne protège que ce qu'il surveille : ici le shell et la
lecture de fichiers, pas leur écriture. On empile donc plusieurs garde-fous.

## Question de contrôle (po)
Q : pourquoi la phrase « ne mets jamais de secret » dans CLAUDE.md ne suffit-elle pas ?
Attendu : c'est une instruction que l'IA peut ignorer ou oublier ; un hook bloque physiquement.
