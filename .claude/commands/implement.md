---
description: Dérouler le plan de la spec, en buildant/testant à chaque étape.
---
Implémente la story cadrée dans la dernière spec (`docs/features/*.md`).

Règles :
- Avance **step by step** ; après chaque étape backend, lance les tests : `pytest -q` dans `backend/` si Python
  et les dépendances sont installés, sinon via Docker (image construite par `docker compose up --build`) :
  `docker run --rm -v "$PWD/backend:/app" -w /app local/todo-backend pytest -q` (Windows / Git Bash : préfixer par `MSYS_NO_PATHCONV=1`).
- Après une étape frontend, lance `npm run build` pour vérifier que ça compile.
- Respecte les skills `python-api` et `react-ui`.
- Ne touche PAS à l'auth ni aux workflows CI/CD sans demande explicite.
- Commit par étape (Conventional Commits), jamais sur `main` (le hook le bloque de toute façon).

À la fin : résume les fichiers touchés et l'état des tests.
