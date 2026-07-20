---
paths:
  - "**/Dockerfile"
  - "docker-compose.yml"
---
# Règle — Images Docker

## Principe
Des images **reproductibles** et **sans secret**.

## Obligatoire
- **Pinner** les versions de base (`python:3.12-slim`, `node:22-alpine`, `nginx:1.27-alpine`) — jamais `latest`.
- Front : build **multi-stage** (build Vite → service nginx), on ne livre pas les `node_modules`.
- Aucun **secret** dans un `ARG`/`ENV`/layer : les valeurs sensibles arrivent au **runtime** (env/volumes),
  pas au build. `VITE_API_URL` est une URL publique, pas un secret.
- `docker-compose.yml` : ports **paramétrables** (`${BACKEND_PORT:-8000}`…), un **healthcheck** par service.

## Interdit
- Tag `latest` sur une image de base · `COPY .env` dans une image · clé/token en `ARG`.
