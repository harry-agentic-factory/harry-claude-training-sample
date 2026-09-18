# Module 03 — CLI / VS Code · se connecter
Fiche : §3 · Profils : tous · Durée : ~5 min

## Concept
Même compte, même config (`~/.claude/`) sur toutes les surfaces : CLI `claude`, plugin VS Code /
JetBrains, desktop, web. Deux façons de se connecter : abonnement (`/login`) ou clé API
(`ANTHROPIC_API_KEY`, qui **prime** si définie). Une clé ne se commit jamais.

## Pas 1/1 — Où suis-je ?
**Exercice (tous)** : tape `/status`. Repère : version de Claude Code, compte, modèle courant, dossier
de travail. Puis `/model` : note le modèle par défaut du repo (fixé par `.claude/settings.json`).
**Vérification** : tu me donnes le modèle courant (attendu : sonnet, sauf si tu l'as changé).

## À retenir
Une seule config partagée par toutes les surfaces. `ANTHROPIC_API_KEY` prime sur l'abonnement :
attention aux variables d'environnement qui traînent.
