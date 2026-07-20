---
paths:
  - "frontend/src/**/*.jsx"
  - "frontend/src/**/*.js"
---
# Règle — Accès données côté front

## Principe
Le réseau est **centralisé** et l'UI reste prévisible. Un composant ne parle jamais au réseau en direct.

## Obligatoire
- Tout appel réseau passe par `src/api.js`. **Aucun `fetch()` dans un `.jsx`.**
- L'URL de l'API vient de `import.meta.env.VITE_API_URL` — **jamais** d'URL en dur dans un composant.
- Toute erreur réseau est **remontée à l'utilisateur** (état d'erreur), pas avalée ni `console.log`-ée.
- Accessibilité minimale : `aria-label` sur les champs sans label visible, `aria-pressed` sur les toggles.

## Interdit
- `fetch`/`axios` inline dans un composant · URL de prod codée en dur · `console.log` de données.
