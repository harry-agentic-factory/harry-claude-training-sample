# Archivé le 2026-09-17 — fonctionnalité « voix » (Kokoro + espeak-ng) retirée à la demande du formateur

Contenu : worker vocal (`webview/voice.worker.ts`), client audio (`webview/voice.ts`), typage espeak,
script de téléchargement du modèle (`scripts/fetch-model.mjs`), tests hors-ligne (`test/`).
Dépendances retirées de package.json : `@huggingface/transformers`, `kokoro-js`, `espeak-ng`.
Non archivés (reproductibles) : `models/` (≈ 93 Mo, `node scripts/fetch-model.mjs`), `test/sample-fr.wav`, `dist/`.

Pour restaurer : réinstaller les 3 dépendances, remettre les fichiers, rajouter l'entrée `webview/voice.worker.ts`
et la copie des assets ORT/espeak dans `esbuild.mjs`, `!models/**` dans `.vscodeignore`, et la CSP
(`blob:` + `'wasm-unsafe-eval'` + `worker-src`) dans `src/sidebarProvider.ts`.
