# Module 00 — Préparation
Fiche : §0 et §17 · Profils : tous · Durée : ~15 min

## Concept
On ne travaille jamais sur `main`, et on vérifie l'outillage **avant** de commencer : la moitié des
« ça ne marche pas » d'une formation viennent de là. Ici, c'est Harry qui répare — pas toi.

## Pas 1/3 — Ta branche
<!-- tuteur : prénom, profil et OS sont déjà connus (cf. « Premier lancement » dans SKILL.md). Rappelle en une ligne ce que le profil implique. -->
**Exercice (po)** : demande-moi :
> Crée ma branche de travail formation/<prenom>

**Exercice (dev / techlead)** : dans ton terminal (Git Bash / zsh), ou en me le demandant :
```
git switch -c formation/<prenom>
```
**Vérification** : je lance `git branch --show-current` : il doit répondre autre chose que `main`.

## Pas 2/3 — Diagnostic (Harry s'en charge)
<!-- tuteur : pas « le tuteur exécute », pas de tour mort. Lance ces contrôles un par un, montre le tableau, et si tout est OK valide le pas et présente le pas 3 dans le même message. -->
Rien à faire de ton côté : je lance les contrôles et je t'affiche un tableau OK / KO / non bloquant :
- `uname -s` (`MINGW*` / `MSYS*` = Windows avec Git for Windows · `Darwin` = macOS) ·
  `git --version` · `docker --version` · `docker compose version` · `node --version` · `jq --version`
- `docker info --format '{{.ServerVersion}}'` → le démon tourne ? (Windows / macOS : Docker Desktop lancé)
- Tes propres tools : `mcp__playwright__*` présents ? (sinon : Node manquant ou serveur non chargé →
  `/mcp` dans Claude Code) · `mcp__github__*` présents **et autres que** `authenticate` /
  `complete_authentication` ? (sinon : « github non connecté — **non bloquant** pour la formation »)
- Windows : `jq` absent → le hook **secrets** (module 06) sera inerte (le hook push-main a un repli) →
  `winget install jqlang.jq`.
- VS Code : `code --version` répond ? Si oui et que `code --list-extensions` ne contient pas
  `harington.harry-ai-tutor`, propose (avec son accord) : `bash tools/harry-ai-tutor/install.sh`
  (Windows PowerShell : `powershell -ExecutionPolicy Bypass -File tools\harry-ai-tutor\install.ps1`). Le script installe aussi l'extension Claude Code si elle manque.
- Playwright : au premier usage il télécharge Chromium (~150 Mo) ; derrière un proxy d'entreprise,
  prévenir le formateur.
**Réparation** : je te propose la commande d'installation adaptée à ton OS (brew / winget ou choco / apt).
Je n'installe rien sans ton accord.
**Vérification** : tout est OK, ou les KO sont non bloquants (github MCP) : je valide et j'enchaîne le pas 3.

## Pas 3/3 — L'app tourne
**Exercice (po)** : Docker Desktop lancé, puis demande-moi :
> Lance l'app avec docker compose et dis-moi quand les deux services sont healthy

**Exercice (dev / techlead)** : dans ton terminal, ou en me le demandant :
```
docker compose up --build -d      # première fois : 2-3 min
docker compose ps                 # backend ET frontend : healthy
```
Puis (tous) ouvre http://localhost:8080 dans ton navigateur : ajoute une tâche, coche-la, supprime-la.
**Si ça bloque** : port pris → via moi, ou dans Git Bash / zsh (pas PowerShell) :
`BACKEND_PORT=18000 FRONTEND_PORT=18080 VITE_API_URL=http://localhost:18000 docker compose up --build -d`
(note les ports dans `notes`). Docker Desktop pas lancé → le lancer, puis relancer.
**Vérification** : je lance `docker compose ps` : les 2 services doivent être `healthy`.

## À retenir
Branche + outillage vérifié + app qui tourne = tu peux tout casser sans risque. C'est le bac à sable.
