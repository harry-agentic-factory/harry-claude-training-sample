# Brain — Utiliser le harness Claude Code

Ce repo embarque un `.claude/` complet. Voici **ce que fait chaque brique** et **comment la lancer**.

## Prérequis

Ouvrir le repo dans Claude Code (CLI `claude` dans le dossier, ou plugin VS Code). Au démarrage,
Claude lit `CLAUDE.md` + le brain `docs/`. Le MCP (`.mcp.json`) et les hooks (`settings.json`) sont
chargés automatiquement.

---

## 1. Predefined commands (`.claude/commands/`)

Une command = un **prompt réutilisable** exécuté **dans la session courante** (contexte partagé).
On la lance en **tapant `/<nom>` en début de message**, avec un argument libre (`$ARGUMENTS`).

| Command | Ce qu'elle fait | Comment la lancer |
|---|---|---|
| `/scope <idée>` | Cadre une idée en mini-PRD (problème, périmètre, stories). Ne code pas. Écrit `docs/features/<slug>.md`. | `/scope filtrer les tâches par état` |
| `/spec <story>` | Critères d'acceptation (Given/When/Then) + plan technique + **invariants** (checklist reviewer). Ne code pas. | `/spec TODO-1 filtre Actives/Terminées` |
| `/implement` | Déroule le plan de la dernière spec, step by step, en lançant `pytest`/`npm run build` à chaque étape. | `/implement` |
| `/test <story>` | Recette : `pytest` + build front + parcours UI (Playwright), vs les critères d'acceptation. | `/test TODO-1` |

Enchaînement type : `/scope …` → `/spec …` → `/implement` → `/test …`.

---

## 2. Agents (`.claude/agents/`)

Un agent = un **worker au contexte isolé** (sa propre fenêtre, ses tools, son modèle). On le lance en
**langage naturel** (« lance l'agent X … ») ou via le mécanisme de sous-agent de Claude Code ; il
travaille à part et renvoie un **verdict**, sans polluer la conversation.

| Agent | Rôle | Droits | Comment le lancer |
|---|---|---|---|
| `reviewer` | Relit le diff vs les invariants de la spec + skills `python-api`/`react-ui`. **Lecture seule.** | `Read, Grep, Glob` | « lance l'agent **reviewer** sur le diff de TODO-1 » |
| `tester` | Recette la UI via **MCP Playwright** (login, clics, vérifs) vs critères. Anti-flaky. | tools `mcp__playwright__*`, `Read` | « lance l'agent **tester** sur la feature filtre » |
| `deployer` | Déploie. **Le mode est donné à l'appel** : `local` → skill `local-deploy` ; `remote` → skill `docker-deploy`. | `Bash, Read` | « lance l'agent **deployer** en mode **local** » |

> **Command vs agent** : la command s'exécute dans TA conversation (contexte partagé) ; l'agent repart
> d'un **contexte neuf** avec des **droits propres** (ex. reviewer ne peut rien modifier). On délègue à
> un agent ce qui est cadré/répétitif et qu'on ne veut pas dans le fil.
>
> ⚠️ Un agent **ne peut pas** appeler une slash command ; il peut appeler un **outil MCP**. L'état
> partagé passe donc par des fichiers (`docs/…`) ou le MCP, jamais par « la conversation ».

---

## 3. Skills (`.claude/skills/`)

Une skill = un **savoir-faire** chargé **à la demande** (économe en contexte). Un agent (ou toi) la
charge quand elle est pertinente.

| Skill | Encode | Chargée par |
|---|---|---|
| `python-api` | conventions FastAPI (controller mince, Pydantic, tests) | reviewer, `/implement` |
| `react-ui` | conventions React (fetch dans `api.js`, `VITE_API_URL`, a11y) | reviewer, `/implement` |
| `local-deploy` | déploiement docker compose **même host** + rollback | deployer (mode `local`) |
| `docker-deploy` | build+push GHCR → GitHub Actions → VM | deployer (mode `remote`) |

**Coupler agent + skills** : `reviewer` + (`python-api`, `react-ui`) = sa grille de revue ; `deployer` +
`local-deploy`/`docker-deploy` = sa procédure. Améliore la skill → tous les agents en profitent.

---

## 4. MCP (`.mcp.json`)

| Serveur | Type | Usage |
|---|---|---|
| `playwright` | local (stdio) | piloter un navigateur pour la recette UI (agent `tester`, ou en interactif) |
| `github` | http | PR/issues, statut des Actions |

Outils nommés `mcp__<serveur>__<outil>` (ex. `mcp__playwright__browser_click`). Utilisables **en
interactif** (« ouvre l'app et crée une tâche ») ou **par un agent** (le `tester`).

---

## 5. Garde-fous (hooks, `.claude/settings.json`)

Des hooks `PreToolUse` qui **empêchent** (mécanisme, pas recommandation) :

| Hook | Bloque |
|---|---|
| `block-protected-branch.sh` | tout `git push` vers `main`/`master`/`production` (→ passer par une PR) |
| `block-secret-exposure.sh` | toute commande/lecture exposant un secret (`cat .env`, `echo $TOKEN`, `kubectl get secret -o yaml`, `Read`/`Grep` sur `*.env`/`*.pem`…) |

Ils sont câblés dans `settings.json` (`permissions` + `hooks`). Bypass ponctuel documenté en tête de
chaque script (`~/.claude-allow-*`).

---

## Cycle complet (exemple exécutable)

```
/scope ajouter une date d'échéance aux tâches
/spec  TODO-2 champ dueDate + tri par échéance
/implement
/test  TODO-2
```
puis : « lance l'agent **reviewer** sur le diff », « lance l'agent **deployer** en mode **local** »,
« lance l'agent **tester** sur TODO-2 ».
