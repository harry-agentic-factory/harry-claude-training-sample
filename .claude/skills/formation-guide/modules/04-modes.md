# Module 04 — Les modes
Fiche : §4 · Profils : tous (po : pas 1) · Durée : ~20 min (po ~10)

## Concept
Chaque action de Claude passe par un **mode de permission**. Les 3 à connaître : `default` (il te demande avant de
modifier un fichier), `plan` (lecture seule : il propose un plan, ne touche à rien) et `acceptEdits` (les
modifications de fichiers passent sans question). Un 4ᵉ mode, `auto`, laisse Claude juger lui-même ce qui est sûr ;
il se règle dans tes réglages personnels, pas dans ceux du projet.

Le mode actif s'affiche **en bas de la zone de saisie**, sous un nom lisible qui n'est pas toujours le nom technique :
**Manual** = `default`, **Plan** = `plan`, **Edit automatically** = `acceptEdits`, **Auto** = `auto`. Pour en changer : **Shift+Tab** dans un terminal (chaque appui passe au suivant), ou un
**clic sur ce libellé** dans VS Code. Réflexe : tâche non triviale → `plan` d'abord.

## Pas 1/4 — Réfléchir sans risque (plan)
<!-- tuteur : indices — 1) « Regarde en bas de la zone de saisie : un libellé indique le mode actif. » 2) « Clique sur ce libellé, ou appuie sur Shift+Tab, jusqu'à voir « Plan ». » 3) « Si ta session ne te laisse pas changer de mode, dis-le-moi, on note le détour. » Tu vérifies toi-même `git status --short` au `suivant`. -->
**Cas concret** : on te demande « ajoute une date d'échéance aux tâches ». Tu veux voir l'approche avant qu'une seule
ligne soit écrite.

**Exercice** : passe en mode **Plan** (clic sur le libellé en bas de la zone de saisie, ou Shift+Tab). **Ensuite**, tape
dans la conversation :
> Propose un plan court (5 lignes maximum) pour ajouter une date d'échéance aux tâches (back + front).

**Vérification** : tu as un plan sous les yeux, et je contrôle moi-même que **aucun fichier n'a changé**.

## Pas 2/4 — Voir la demande de permission (default) — dev / techlead
<!-- tuteur : indices — 1) « Le mode default s'appelle « Manual » en bas de la zone de saisie. » 2) « Clique sur le libellé, ou appuie sur Shift+Tab, jusqu'à voir « Manual ». » 3) « À la question posée, choisis No. » Ne demande pas de réponse au pari avant le `suivant`. -->
**Cas concret** : tu veux garder la main sur chaque modification de ton code.

**Pari** : à ton avis, Claude va-t-il modifier le fichier tout de suite ? Garde ta réponse : tu me la donneras avec ton
`/formation suivant`.

**Exercice** : passe en mode **Manual** (c'est `default`) : clic sur le libellé, ou Shift+Tab autant de fois que
nécessaire. **Ensuite**, tape dans la conversation :
> Ajoute un commentaire d'une ligne en tête de frontend/src/api.js : « Client API — formation ».

Une demande de permission apparaît : choisis **No**.

**Vérification** : tu me dis ce que tu as vu et si ton pari était bon, et je contrôle que le fichier n'a pas changé.

## Pas 3/4 — Laisser passer les éditions (acceptEdits) — dev / techlead
<!-- tuteur : indices — 1) « Même geste que tout à l'heure : clic sur le libellé ou Shift+Tab. » 2) « Cherche « Edit automatically » (« accept edits on » dans un terminal). » 3) « Redemande exactement la même chose. » -->
**Cas concret** : le plan te convient, tu veux enchaîner de petites modifications sans valider chacune.

**Exercice** : passe en mode **Edit automatically** (clic sur le libellé, ou Shift+Tab). **Ensuite**, redemande dans la
conversation la même modification : cette fois, elle passe sans question. Annule-la en me demandant :
> Lance git checkout -- frontend/src/api.js

**Vérification** : je contrôle que `git status --short` est de nouveau vide.

## Pas 4/4 — Quand les demandes t'agacent (règles perso ou d'équipe) — dev / techlead
<!-- tuteur : indices — 1) « Relis les 3 choix proposés par la demande de permission. » 2) « Une règle d'équipe est commitée ; une règle perso ne l'est pas. » 3) « Perso : `.claude/settings.local.json` (git-ignoré). Équipe : `.claude/settings.json`. » Rappelle que « Yes, allow … for this project (shared) » peut écrire dans le fichier d'équipe. -->
**Cas concret** : tu valides la même commande dix fois par jour. Tu voudrais qu'elle passe toute seule, sans l'imposer à
ton équipe.

Une **règle d'autorisation** est une ligne qui dit « ceci passe sans demander ». Elle est **perso** si elle est dans
`.claude/settings.local.json` (jamais commité : elle ne s'applique qu'à toi) ou **d'équipe** si elle est dans
`.claude/settings.json` (commité : elle s'applique à tout le monde).

**Exercice** : tape dans la conversation :
> Montre-moi les 3 derniers commits avec git log --oneline -3.

Une demande de permission apparaît. Lis ses choix : **Yes** (cette fois seulement), **Yes, allow… for this project**
(crée une règle qui s'applique ensuite sans question) et **No**. Choisis **Yes**.

À savoir : certains dossiers, comme `.claude/` et `.git/`, demandent **toujours** une confirmation, même avec une règle
d'autorisation. C'est voulu : Claude ne doit pas réécrire sa propre configuration sans toi.

**Vérification** : tu me dis dans quel fichier irait une règle **personnelle** et dans quel fichier une règle
**d'équipe**. Tu peux ouvrir `.claude/` pour le retrouver.

Fichiers clés : `.claude/settings.json` (équipe, commité) et `.claude/settings.local.json` (perso, git-ignoré).

## À retenir
`plan` pour réfléchir, `default` au quotidien, `acceptEdits` pour dérouler un travail cadré. Une règle perso va dans
`settings.local.json`, une règle d'équipe dans `settings.json`.

## Question de contrôle (po)
Q : dans quel mode Claude ne peut rien modifier mais te propose une démarche ?
Attendu : plan.
