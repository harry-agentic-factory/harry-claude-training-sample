# Brain — Architecture technique

## Vue d'ensemble

```
┌────────────┐        HTTP/JSON        ┌────────────┐
│  frontend  │ ──────────────────────▶ │  backend   │
│ React+Vite │   VITE_API_URL          │  FastAPI   │
│  (nginx)   │ ◀────────────────────── │  + SQLite  │
└────────────┘                         └────────────┘
   :8080 (host)                          :8000 (host)
```

Deux conteneurs orchestrés par `docker-compose.yml`. Le front est un bundle statique servi par nginx ;
il appelle l'API dont l'URL est **injectée au build** (`VITE_API_URL`).

## Backend (`backend/`)

- **Stack** : Python 3.12, FastAPI, SQLite (sans ORM, pour rester lisible).
- **Structure** :
  - `app/main.py` — app FastAPI, CORS, `init_db()` au démarrage (lifespan), route `/health`.
  - `app/database.py` — `db_path()` (lu dynamiquement via `TODO_DB_PATH`, testable) + `get_conn()`.
  - `app/models.py` — schémas Pydantic (`TodoCreate`, `TodoUpdate`, `Todo`).
  - `app/routers/todos.py` — endpoints CRUD (controller mince).
  - `tests/test_todos.py` — tests API (TestClient + base jetable), config `pytest.ini` (`pythonpath=.`).
- **Données** : fichier SQLite dans `/data` (volume Docker `todo-data`), variable `TODO_DB_PATH`.

### Contrat d'API

| Méthode | Route | Corps | Réponse | Notes |
|---|---|---|---|---|
| GET | `/health` | — | `{"status":"ok"}` | sonde liveness |
| GET | `/todos` | — | `[Todo]` | toutes les tâches |
| GET | `/todos?done=true\|false` | — | `[Todo]` | **filtre** par état (SQL paramétré) |
| POST | `/todos` | `{title}` | `201 Todo` | crée |
| PATCH | `/todos/{id}` | `{title?, done?}` | `Todo` | maj partielle ; `404` si absent |
| DELETE | `/todos/{id}` | — | `204` | supprime ; `404` si absent |

`Todo = {id:int, title:str, done:bool}`.

## Frontend (`frontend/`)

- **Stack** : React 18, Vite 6, servi par nginx (SPA fallback `try_files … /index.html`).
- **Structure** :
  - `src/api.js` — **client d'API centralisé** (toute requête réseau passe ici) ; base = `VITE_API_URL`.
  - `src/App.jsx` — état local (`useState`/`useEffect`), liste + formulaire + **filtres** (Toutes/Actives/Terminées).
  - `src/main.jsx`, `index.html`, `vite.config.js`, `nginx.conf`.

## Conventions (source de vérité = les skills)

Les conventions ne sont pas répétées ici : elles vivent dans les skills, chargées à la demande —
c'est **elles** que l'agent `reviewer` applique.
- Backend → [`../.claude/skills/python-api/SKILL.md`](../.claude/skills/python-api/SKILL.md)
- Frontend → [`../.claude/skills/react-ui/SKILL.md`](../.claude/skills/react-ui/SKILL.md)

## Configuration & environnement

| Variable | Où | Rôle | Défaut |
|---|---|---|---|
| `TODO_DB_PATH` | backend | chemin SQLite | `todo.db` (conteneur : `/data/todo.db`) |
| `VITE_API_URL` | build front | URL de l'API (baked) | `http://localhost:8000` |
| `BACKEND_PORT` | compose | port host du back | `8000` |
| `FRONTEND_PORT` | compose | port host du front | `8080` |
| `REGISTRY` / `TAG` | compose | image (déploiement) | `local` / `latest` |

## Garde-fous techniques

- **Secrets** : jamais en clair, jamais loggés ; via variables d'env / `.env` (git-ignoré).
- **Hooks** `PreToolUse` : bloquent le push sur branche protégée et l'exposition de secrets
  (voir [ci-cd.md](ci-cd.md) et [usage.md](usage.md)).
