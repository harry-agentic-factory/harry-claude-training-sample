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
<!-- tuteur : pas « le tuteur exécute », pas de tour mort. Lance ces contrôles un par un, montre le tableau, et si tout est OK valide le pas et présente le pas 3 dans le même message. Le mode (docker/natif) est déjà connu depuis « Premier lancement » (SKILL.md) — s'il a répondu « pas sûr », c'est ici que tu tranches : vérifie docker info, propose le mode qui marche, et fixe `mode` dans progress.json avant le pas 3. -->
Rien à faire de ton côté : je lance les contrôles et je t'affiche un tableau OK / KO / non bloquant,
adaptés à ton mode (`docker` ou `natif`, choisi à l'accueil) :
- `uname -s` (`MINGW*` / `MSYS*` = Windows avec Git for Windows · `Darwin` = macOS) ·
  `git --version` · `node --version` · `jq --version`
- Mode `docker` : `docker --version` · `docker compose version` ·
  `docker info --format '{{.ServerVersion}}'` → le démon tourne ? (Windows / macOS : Docker Desktop lancé)
- Mode `natif` : `python3 --version` (≥ 3.12) — pas de démon à vérifier.
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
**Réparation** : je te propose la commande d'installation adaptée à ton OS (brew / winget ou choco /
apt). Je n'installe rien sans ton accord. Mode `natif` choisi mais Docker en fait disponible et
fonctionnel ? Dis-le : je peux repasser `mode` à `docker` (plus simple pour la suite, notamment le
module 11).
**Vérification** : tout est OK, ou les KO sont non bloquants (github MCP) : je valide et j'enchaîne le pas 3.

## Pas 3/3 — L'app tourne
**Exercice (po), mode docker** : Docker Desktop lancé, puis demande-moi :
> Lance l'app avec docker compose et dis-moi quand les deux services sont healthy

**Exercice (dev / techlead), mode docker** : dans ton terminal, ou en me le demandant :
```
docker compose up --build -d      # première fois : 2-3 min
docker compose ps                 # backend ET frontend : healthy
```

**Exercice (po), mode natif** : demande-moi :
> Lance l'API et le front sans Docker et dis-moi quand les deux sont prêts

**Exercice (dev / techlead), mode natif** : deux terminaux, ou en me le demandant :
```
# Terminal 1 — API
cd backend && python3 -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# Terminal 2 — front
cd frontend && npm install && npm run dev
```

Puis (tous) ouvre http://localhost:8080 (mode docker) ou http://localhost:5173 (mode natif) dans ton
navigateur : ajoute une tâche, coche-la, supprime-la.
**Si ça bloque** : port pris → cf. « Ports pris » de `SKILL.md` (remap docker ou natif selon ton
mode, note les ports dans `notes`). Mode docker et Docker Desktop pas lancé → le lancer, puis relancer.
**Vérification** : mode docker → je lance `docker compose ps` : les 2 services doivent être
`healthy`. Mode natif → les deux process tournent (visibles dans le tour précédent) et
`python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"` répond
`{"status":"ok"}`.

## À retenir
Branche + outillage vérifié + app qui tourne = tu peux tout casser sans risque. C'est le bac à sable.
