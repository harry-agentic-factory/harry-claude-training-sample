# Module 12 — Les skills
Fiche : §12 · Profils : dev, techlead (po : question) · Durée : ~15 min (po ~5)

## Concept
Une **skill** est un savoir-faire réutilisable (`.claude/skills/<nom>/SKILL.md`), chargé **à la demande**,
contrairement à `CLAUDE.md` qui l'est toujours. Un agent dit **qui** et avec quels droits ; une skill dit
**comment**. Plusieurs agents partagent une skill : on améliore la méthode à un seul endroit.

## Pas 1/1 — Changer la méthode, pas l'agent
**Cas concret** : l'équipe décide que tout endpoint doit avoir une docstring. Tu ne veux pas réécrire chaque
agent : tu ajoutes la règle à la skill qu'ils lisent tous.

**Exercice (dev / techlead)** : demande à Claude d'ajouter cette ligne à la fin de `.claude/skills/python-api/SKILL.md` :
```
8. **Docstring** : tout endpoint a une docstring d'une ligne.
```
Claude va te demander la permission d'écrire dans `.claude/` : c'est normal, c'est un dossier protégé. Choisis **Yes**.
Relance le reviewer (module 11) : il signale maintenant les endpoints sans docstring, **sans que tu aies
touché `reviewer.md`**.

**Vérification** : le nouveau verdict mentionne la docstring (sinon, tu m'expliques pourquoi).

Fichier clé : `.claude/skills/python-api/SKILL.md`.

## À retenir
Améliore la skill : tous les agents qui la chargent en profitent.

## Question de contrôle (po)
Q : quelle différence entre une rule, une skill et un hook ?
Attendu : rule = guide, chargée auto (parfois par chemin) ; skill = savoir-faire appelé à la demande ;
hook = mécanisme qui empêche.
