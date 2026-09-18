# CLAUDE.md — Todo app (bac à sable de formation Claude Code)

> Fichier **chargé à chaque session** : il reste **court** et sert d'**index**. Le détail vit dans le
> brain [`docs/`](docs/). Support de la fiche « Prise en main de Claude » (Harington Tech).

## Ce qu'est ce dépôt

Une petite app **todo** (React + FastAPI, Docker, GitHub Actions) dont le vrai sujet est le dossier
[`.claude/`](.claude/) : un exemple **complet et runnable** de harness Claude Code (commands, agents,
skills, hooks, MCP). L'app est minimale **exprès** — l'intérêt est la méthode.

## Le brain (source de vérité détaillée)

| Doc | Contenu |
|---|---|
| [docs/functional.md](docs/functional.md) | Présentation fonctionnelle : quoi / pourquoi / qui, parcours utilisateur, périmètre |
| [docs/technical.md](docs/technical.md) | Architecture, **contrat d'API**, structure back/front, config & env |
| [docs/ci-cd.md](docs/ci-cd.md) | Conteneurs, CI, CD (illustratif), déploiement local vs remote, rollback |
| [docs/usage.md](docs/usage.md) | **Comment marchent et comment lancer** les commands, agents, skills, MCP, hooks |
| [docs/features/](docs/features/) | Features cadrées (`/scope` + `/spec`) — ex. `filtre-taches.md` |
| [docs/formation-prerequis.md](docs/formation-prerequis.md) | Checklist d'installation à envoyer aux stagiaires avant la formation (`/formation`) |

## Architecture (résumé)

`frontend` React/Vite servi par nginx (:8080) → appelle `backend` FastAPI + SQLite (:8000).
Orchestré par `docker-compose.yml`. Contrat d'API et structure détaillés dans
[docs/technical.md](docs/technical.md).

## Le harness en un coup d'œil

- **Commands** ([`.claude/commands/`](.claude/commands/)) : `/scope` → `/spec` → `/implement` → `/test`.
- **Agents** ([`.claude/agents/`](.claude/agents/)) : `reviewer` (lecture seule), `tester` (Playwright),
  `deployer` (**mode `local`/`remote` donné à l'appel** → charge la skill correspondante).
- **Skills** ([`.claude/skills/`](.claude/skills/)) : `python-api`, `react-ui`, `local-deploy`, `docker-deploy`.
- **MCP** ([`.mcp.json`](.mcp.json)) : `playwright` (recette UI), `github` (PR/CI).
- **Hooks** ([`.claude/hooks/`](.claude/hooks/)) : bloquent push `main` et exposition de secrets.
- **Rules** ([`.claude/rules/`](.claude/rules/)) : conventions **auto-découvertes** — toujours actives
  (`secrets`, `git-hygiene`) ou ciblées par chemin (`sql-safety`, `frontend-data`, `docker-images`).
- **Formation** : `/formation` — tuteur pas à pas (profils `dev` / `po` / `techlead`), méthode dans la
  skill `formation-guide`, progression dans `.formation/` (git-ignoré). Compagnon VS Code optionnel :
  [`tools/harry-ai-tutor/`](tools/harry-ai-tutor/) (carte, étape, fichiers, bilan, Suivant → Claude Code).

→ Détail d'utilisation : [docs/usage.md](docs/usage.md).

## Conventions (à respecter)

Les conventions de code sont dans les **skills** (chargées à la demande, appliquées par le `reviewer`) :
- Backend → [`.claude/skills/python-api/SKILL.md`](.claude/skills/python-api/SKILL.md)
- Frontend → [`.claude/skills/react-ui/SKILL.md`](.claude/skills/react-ui/SKILL.md)

## Garde-fous (repo)

- **Secrets** : jamais en clair, jamais loggés ; variables d'env / `.env` (git-ignoré). Hook dédié.
- **Branches protégées** : pas de `git push` direct sur `main` (hook + PR). Conventional Commits.
- **Ne pas** modifier les workflows CI/CD ni les hooks sans demande explicite.

## Lancer en local

```bash
docker compose up --build      # front http://localhost:8080 · API http://localhost:8000/docs
# Tests back : docker run --rm -v "$PWD/backend:/app" -w /app local/todo-backend pytest -q
#   (Windows / Git Bash : MSYS_NO_PATHCONV=1 docker run …)
```
Détail (ports, rollback, modes) : [docs/ci-cd.md](docs/ci-cd.md).
