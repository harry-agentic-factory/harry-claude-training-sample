# Plan — refonte de la formation /formation

Objectif : que les devs maîtrisent les **concepts clés** et les **fichiers clés** de Claude Code, avec un
format simple et un suivi visuel. Tous les modules sont conservés.

## Format unique d'un module
1. **Concept** : une phrase, sans jargon.
2. **Cas concret** : une situation réelle de dev.
3. **Exercice** : une seule consigne, toujours « tape ceci dans la conversation ».
4. **Validation** : vérifiée par l'état du repo ou un tool visible.
5. **Fichier clé** : le fichier à ouvrir pour voir le résultat.

## Étapes (une étape = un commit)
| # | Étape | Statut |
|---|---|---|
| 1 | Onboarding : module 00 simplifié, accueil sans Docker ni branche, SKILL.md | fait (non commité) |
| 2 | Retirer Docker/natif et « 00 pas 3 » de parcours.md et des modules 10, 11, 13, 17 | fait (non commité) |
| 3 | Module 06 : démo du hook secrets (on tente d'écrire un secret, le hook bloque) | fait (non commité) |
| 4 | Modules 01 à 05 au nouveau format | fait (non commité) |
| 5 | Modules 07 à 12 au nouveau format | fait (non commité) |
| 6 | Modules 13 à 17 au nouveau format | fait (non commité) |
| 7 | Page HTML de suivi (voir ci-dessous) | fait (non commité) |

## Suivi visuel
Source de vérité : `.formation/progress.json`. L'extension VS Code `harry-ai-tutor` affiche déjà une carte
animée, mais elle exige la commande `code` et VS Code. La page HTML autonome la complète : elle marche
sans VS Code, se partage avec le formateur et montre le parcours en serpent (modules faits, en cours,
sautés, optionnels, cliquables pour voir l'exercice).

## Questions ouvertes
- La page HTML doit-elle lire `.formation/progress.json` en direct (petit serveur local) ou se générer à
  la demande par `/formation bilan` ?
