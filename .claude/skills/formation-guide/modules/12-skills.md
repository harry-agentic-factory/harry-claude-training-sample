# Module 12 — Skills
Fiche : §12 · Profils : dev, techlead (po : question) · Durée : ~15 min (po ~5)

## Concept
Une skill = un savoir-faire réutilisable (`.claude/skills/<nom>/SKILL.md`), chargé **à la demande** —
contrairement à CLAUDE.md, toujours chargé. Agent = qui + droits ; skill = **comment**. Plusieurs
agents partagent une skill : on améliore la méthode à un seul endroit. Ici : `python-api`, `react-ui`
(conventions = grille du reviewer), `local-deploy`, `docker-deploy` (procédures du deployer),
`formation-guide` (ma méthode de tuteur).

## Pas 1/1 — Changer la méthode, pas l'agent
**Exercice (dev / techlead)** : ajoute une convention à `.claude/skills/python-api/SKILL.md`, ex. :
```
8. **Docstring** : tout endpoint a une docstring d'une ligne.
```
Relance le reviewer (module 11) sur ta branche → il signale maintenant les endpoints sans docstring,
**sans que tu aies touché `reviewer.md`**.
**Vérification** : le nouveau verdict mentionne la docstring (sinon, tu m'expliques pourquoi).

## À retenir
Améliore la skill → tous les agents qui la chargent en profitent. C'est là que vit la « méthode maison ».

## Question de contrôle (po)
Q : quelle différence entre une rule, une skill et un hook ?
Attendu : rule = guide, chargée auto (parfois par chemin) ; skill = savoir-faire appelé à la demande ;
hook = mécanisme qui empêche.
