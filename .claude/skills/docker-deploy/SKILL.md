---
name: docker-deploy
description: Méthode de build & déploiement Docker de ce repo. À charger par l'agent deployer.
---
# Déploiement (Docker + docker compose + GitHub Actions)

> Équivalent, chez Talenteo, de la skill `deploy-jenkins` (Jenkins → Helm → AKS).
> Ici la cible est plus simple : docker compose sur une VM via GitHub Actions.

## Build local
```bash
docker compose build
docker compose up -d          # front :8080, API :8000
docker compose ps             # les 2 services "healthy" (pas de curl : refusé par settings.json)
```

## Déploiement cible (illustratif)
Le déploiement passe par `.github/workflows/deploy.yml` (déclenché sur push `main` ou
manuellement) :
1. Build + push des images sur GHCR (`ghcr.io/<owner>/todo-backend|frontend:<sha>`).
2. Connexion SSH à la VM (`secrets.VM_HOST` / `VM_USER` / `VM_SSH_KEY`).
3. Sur la VM : `docker compose pull && docker compose up -d` (avec `REGISTRY` et `TAG`).
4. Vérif santé : `GET /health` + chargement du front.

## Rollback
Redéployer le `TAG` (SHA) précédent : `export TAG=<sha-précédent> && docker compose up -d`.

## Garde-fous
- Secrets uniquement via GitHub Secrets, jamais dans le repo.
- Ne jamais déployer une branche non recettée en cible.
