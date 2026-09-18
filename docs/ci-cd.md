# Brain — CI/CD & déploiement

## Conteneurisation

- **backend/Dockerfile** : `python:3.12-slim`, installe `requirements.txt`, lance `uvicorn`.
- **frontend/Dockerfile** : multi-stage — build Vite (`node:22-alpine`) → service statique (`nginx:1.27-alpine`).
  `VITE_API_URL` est un **ARG de build** (baked dans le bundle).
- **docker-compose.yml** : 2 services (`backend`, `frontend`), volume `todo-data`, healthcheck back,
  ports configurables (`BACKEND_PORT` / `FRONTEND_PORT`).

## CI — `.github/workflows/ci.yml`

Déclenché sur **PR** et **push main**. Aucun secret requis.
- `backend-tests` : `pip install` + `pytest -q`.
- `frontend-build` : `npm install` + `npm run build`.

## CD — `.github/workflows/deploy.yml` (⚠️ illustratif)

Déclenché sur **push main** ou **manuellement** (`workflow_dispatch`).
1. `build-and-push` : build des 2 images + push sur **GHCR** (`ghcr.io/<owner>/todo-*:<sha>`),
   auth via `GITHUB_TOKEN` (fonctionne).
2. `deploy` : SSH sur une VM + `docker compose pull && up -d`.

> **Secrets (placeholders) à définir** dans *Settings → Secrets and variables → Actions* :
> `VM_HOST`, `VM_USER`, `VM_SSH_KEY`. Tant qu'ils ne sont pas fournis, le stage `deploy` **échoue** —
> c'est **voulu** (support pédagogique). Rien n'est branché à une vraie VM.

## Déploiement — deux modes (choisis par l'agent `deployer`)

Le mode est **donné à l'appel** de l'agent (`local` ou `remote`), qui charge la skill correspondante :

| Mode | Skill | Cible |
|---|---|---|
| `local` | [`local-deploy`](../.claude/skills/local-deploy/SKILL.md) | docker compose sur le **même host** |
| `remote` | [`docker-deploy`](../.claude/skills/docker-deploy/SKILL.md) | GHCR → GitHub Actions → VM (SSH) |

### Déploiement local (tout tester sans VM)

```bash
docker compose up -d --build           # front :8080, back :8000
docker compose ps                      # backend + frontend : healthy (curl est refusé dans Claude Code : deny settings.json)
docker compose down                    # arrêter (–v pour reset des données)
```

Ports occupés ? Remapper : `BACKEND_PORT=18010 FRONTEND_PORT=8080 VITE_API_URL=http://localhost:18010 docker compose up -d --build`.

### Rollback local

Le tag précédent reste dans le cache Docker : revenir au commit précédent puis
`docker compose up -d --build` (voir la skill `local-deploy`).

## Analogie Talenteo

Ici la cible est simple (docker compose sur VM via GitHub Actions). Chez **Talenteo**, le même rôle est
tenu par **Jenkins** (`PipelineCi` → Azure ACR, `PipelineCd` → Helm sur AKS `talenteo-prod`,
`OPTION=Dev/Prod`) — c'est la skill `deploy-jenkins`. Le principe (skill de déploiement paramétrée,
choisie selon le contexte) est identique.
