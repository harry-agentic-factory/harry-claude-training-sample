# Module 03 — Se connecter
Fiche : §3 · Profils : tous · Durée : ~5 min

## Concept
Claude Code marche en terminal (`claude`), dans VS Code ou JetBrains, en application desktop et sur le web, avec
**la même configuration** (le dossier `~/.claude/`). On s'y connecte avec un abonnement (`/login`) ou une clé API.

## Pas 1/1 — Où suis-je ?
<!-- tuteur : indices — 1) « Une commande qui commence par `/` te dit où tu en es. » 2) « C'est `/status`. » 3) « Cherche la ligne du modèle ; sinon ouvre `.claude/settings.json`, clé `model`. » -->
**Cas concret** : Claude répond autrement que chez ton collègue. Première question : avec quel compte, quel modèle,
dans quel dossier travaille-t-il ?

**Avant de lancer** : devine quel **modèle** (le « cerveau » de Claude, par exemple sonnet) est utilisé ici.

**Exercice** : tape `/status` dans la conversation. Il affiche la version, ton compte, le modèle courant et le
dossier de travail.

**Vérification** : tu me donnes le modèle affiché (attendu : sonnet, sauf si tu l'as changé) et tu me dis si ton
pari était bon.

Fichier à ouvrir pour comparer : `.claude/settings.json` (clé `model`).

## À retenir
Une seule configuration pour toutes les surfaces. Si une variable `ANTHROPIC_API_KEY` traîne dans ton environnement,
elle passe avant ton abonnement : `/status` te montre ce qui est vraiment utilisé.
