# Module 03 — Se connecter
Fiche : §3 · Profils : tous · Durée : ~5 min

## Concept
Claude Code marche en terminal (`claude`), dans VS Code / JetBrains, en desktop et sur le web, avec **la même
config** (dossier `~/.claude/`). On se connecte par abonnement (`/login`) ou par clé API
(`ANTHROPIC_API_KEY`, qui **prime** si elle existe). Une clé ne se commit jamais.

## Pas 1/1 — Où suis-je ?
**Cas concret** : Claude répond autrement que chez ton collègue. Première question : quel compte, quel
modèle, quel dossier ?

**Exercice** : tape `/status`. Repère la version, le compte, le modèle courant et le dossier de travail.
Puis tape `/model` et note le modèle par défaut du repo (fixé par `.claude/settings.json`).

**Vérification** : tu me donnes le modèle courant (attendu : sonnet, sauf si tu l'as changé).

Fichier à ouvrir : `.claude/settings.json` (clé `model`).

## À retenir
Une seule config pour toutes les surfaces. Une `ANTHROPIC_API_KEY` oubliée dans l'environnement prime sur
ton abonnement.
