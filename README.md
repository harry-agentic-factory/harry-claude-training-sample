# harry-claude-training-sample

Repo **de formation** pour la fiche « Prise en main de Claude » (Harington Tech). Une petite app de
gestion de **todos** — front **React**, back **Python/FastAPI**, conteneurisée avec **Docker Compose**
et déployée (illustratif) sur une VM via **GitHub Actions**.

Le vrai sujet, c'est le dossier **[`.claude/`](.claude/)** : un exemple complet et runnable de harness
Claude Code (commands, agents, skills, settings, hook, MCP) sur lequel la fiche pointe et dont elle
cite des extraits.

📖 **Brain du projet** (doc détaillée) : [`docs/`](docs/) — [fonctionnel](docs/functional.md) ·
[technique + contrat d'API](docs/technical.md) · [CI/CD & déploiement](docs/ci-cd.md) ·
[**utiliser le harness** (commands, agents, comment les lancer)](docs/usage.md). Entrée : [`CLAUDE.md`](CLAUDE.md).

## Ce que ce repo illustre

| Brique | Où | Ce qu'on y voit |
|---|---|---|
| **CLAUDE.md** | [`CLAUDE.md`](CLAUDE.md) | Mémoire projet : archi, conventions, garde-fous |
| **settings.json** | [`.claude/settings.json`](.claude/settings.json) | `permissions` allow/deny, `model`, `hooks` |
| **Hooks (garde-fous)** | [`.claude/hooks/`](.claude/hooks/) | `block-protected-branch.sh` (bloque `git push` sur `main`) + `block-secret-exposure.sh` (bloque toute commande/lecture exposant un secret) — *mécanisme, pas instruction* |
| **Commands** | [`.claude/commands/`](.claude/commands/) | `/scope` `/spec` `/implement` `/test` · `/formation` (tuteur guidé) |
| **Extension VS Code** | [`tools/harry-ai-tutor/`](tools/harry-ai-tutor/) | Harry AI Tutor : compagnon du tuteur (carte animée, fichiers, bilan, bouton Suivant vers Claude Code) |
| **Agents** | [`.claude/agents/`](.claude/agents/) | `reviewer` (lecture seule), `tester` (Playwright), `deployer` |
| **Skills** | [`.claude/skills/`](.claude/skills/) | `python-api`, `react-ui`, `local-deploy`, `docker-deploy`, `formation-guide` |
| **MCP** | [`.mcp.json`](.mcp.json) | `playwright` (e2e UI), `github` (PR/CI) |
| **CI/CD** | [`.github/workflows/`](.github/workflows/) | `ci.yml` (PR) · `deploy.yml` (illustratif) |

## Coupler agent + skills (le pattern clé)

- `reviewer` charge `python-api` + `react-ui` → sa grille de revue.
- `deployer` charge `docker-deploy` → sa procédure.
- `tester` pilote la UI via le MCP `playwright`.

## Démarrer

```bash
# Tout lancer
docker compose up --build
#  → front  : http://localhost:8080
#  → API    : http://localhost:8000/docs  (Swagger)

# Back en local (sans Docker)
cd backend && pip install -r requirements.txt
pytest -q                                       # tests
uvicorn app.main:app --reload --port 8000        # API

# Front en local (sans Docker)
cd frontend && npm install && npm run dev        # :5173, cible http://localhost:8000
```

## Essayer le harness Claude Code

Ouvre le repo dans Claude Code, puis :

```
/scope ajouter une date d'échéance aux tâches
/spec  TODO-1 champ dueDate + tri par échéance
/implement
/test  TODO-1
```

Puis délègue : « lance l'agent reviewer sur le diff », « lance l'agent tester sur la UI ».

Ou, **guidé pas à pas** (dev, PO ou techlead — en salle ou seul) :

```
/formation            # accueil, profil, diagnostic de l'environnement, puis un module à la fois
/formation suivant    # vérifie l'étape et passe à la suivante
/formation 11         # synchro avec le formateur
```

## ⚠️ Déploiement

`.github/workflows/deploy.yml` est **illustratif** : il suppose une VM SSH + Docker et des secrets
GitHub (`VM_HOST`, `VM_USER`, `VM_SSH_KEY`) en placeholder. Rien n'est branché à une vraie VM.

---

*Harington — On accélère les équipes. On ne remplace pas les gens.*
