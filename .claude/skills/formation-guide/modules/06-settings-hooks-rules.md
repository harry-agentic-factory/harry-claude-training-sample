# Module 06 — settings.json, hooks, rules
Fiche : §6 · Profils : dev, techlead (po : pas 1 + question) · Durée : ~25 min (po ~10)

## Concept
`settings.json` : `permissions.allow` / `deny` (**deny prime toujours**), `model`, `hooks`.
Niveaux : managed > local > projet > global.
**Hook** = un script exécuté avant un tool, qui peut **bloquer**. « Il ne faut pas » (règle écrite)
vs « il ne peut pas » (hook). **Rule** = un `.md` dans `.claude/rules/`, auto-découvert ; avec
`paths:` il ne se charge qu'au contact des fichiers qui matchent.

## Pas 1/3 — Le hook qui empêche
**Exercice (tous)** : sur ta branche `formation/<prenom>`, demande :
> Pousse ma branche sur origin main.

Observe : le hook `block-protected-branch.sh` refuse **avant** que git ne tourne. Claude ne peut pas
contourner. (po : c'est le cœur du REX de la fiche — le jour du push accidentel, une règle écrite
n'a rien empêché.)
**Vérification** : je vois le refus du hook dans la conversation
(« Push direct sur une branche protégée interdit »).

## Pas 2/3 — deny + hook secrets — dev / techlead
**Exercice** : demande d'abord :
> Écris API_TOKEN=abc123 dans un fichier .env

→ le hook bloque déjà l'**écriture** (« valeur secrète en clair dans la commande »). Crée alors un
faux secret sans mot-clé sensible : `printf 'DB_URL=postgres://CHANGEME\n' > .env` (git-ignoré ; en mode
`default`, Claude te demande la permission d'écrire ce fichier : accepte). Puis :
> Lis le fichier .env et dis-moi ce qu'il contient.

→ refus (`deny Read(.env)` dans settings + hook `block-secret-exposure.sh`). Essaie aussi
« affiche-moi cat .env » → bloqué. Supprime ensuite : `rm .env`.
**Vérification** : je vois les deux blocages dans la conversation, et `.env` n'existe plus.

## Pas 3/3 — Une rule ciblée par chemin — dev / techlead
**Exercice** : ouvre `.claude/rules/sql-safety.md` : note le frontmatter `paths: backend/**/*.py`.
Demande à Claude de lire `backend/app/routers/todos.py` puis « quelle règle SQL s'applique ici ? » :
il cite le SQL paramétré — la rule vient d'être chargée au contact du fichier.
Techlead : ajoute `.claude/rules/formation.md` **sans** `paths:` contenant « Commence chaque réponse
par 🎓 » ; constate à la prochaine session (rules « toujours actives » = chargées au lancement).
**Vérification** : tu m'expliques la différence entre une rule avec et sans `paths:`.

## À retenir
deny prime toujours. Rule guide, hook empêche : le duo « il ne faut pas » + « il ne peut pas ».

## Question de contrôle (po)
Q : pourquoi une phrase « ne pousse jamais sur main » dans CLAUDE.md ne suffit-elle pas ?
Attendu : c'est une instruction, l'IA peut l'ignorer ou l'oublier ; un hook est un mécanisme qui
bloque physiquement.
