# Formation « Prise en main de Claude » — à installer AVANT la session

> ~20 min, à faire la veille. Tous profils, **PO compris** : la formation est pratique, chacun a
> Claude Code ouvert sur le repo. En cas de blocage, note l'erreur exacte : on la traite au début.
> Le jour J, le tuteur `/formation` refera ce diagnostic et proposera les réparations.

## 1. Les outils

| Outil | Windows | macOS | Linux (Debian / Ubuntu) |
|---|---|---|---|
| **Git** | [Git for Windows](https://git-scm.com/downloads/win) — **obligatoire** : Claude Code s'en sert pour ses commandes shell, et les garde-fous du repo sont des scripts bash | `xcode-select --install` ou `brew install git` | `sudo apt install git` |
| **Docker** | Docker Desktop, **lancé** | Docker Desktop ou OrbStack, **lancé** | Docker Engine + plugin `docker compose` |
| **Node.js ≥ 20** (pour le navigateur de test) | [nodejs.org](https://nodejs.org) (LTS) | `brew install node` | `sudo apt install nodejs npm` |
| **jq** (pour les garde-fous) | `winget install jqlang.jq` (ou `choco install jq`) | `brew install jq` | `sudo apt install jq` |
| **Claude Code** | PowerShell : `irm https://claude.ai/install.ps1 \| iex` (ou `winget install Anthropic.ClaudeCode`) | `curl -fsSL https://claude.ai/install.sh \| bash` (ou `brew install --cask claude-code`) | `curl -fsSL https://claude.ai/install.sh \| bash` |

**Compte : rien à faire ce soir.** Une **clé API Anthropic personnelle** te sera remise à l'accueil
demain matin ; c'est elle qui donnera accès à Claude Code pendant la formation. Installe simplement
le CLI ci-dessus — `claude --version` et `claude doctor` fonctionnent sans être connecté.

Si tu as déjà un compte **Pro, Max, Team ou Enterprise**, tu peux te connecter dès maintenant
(`claude`, puis suis l'ouverture du navigateur) : ça te permettra de faire l'étape 3 en entier. Sache
juste que demain, la variable d'environnement `ANTHROPIC_API_KEY` **primera** sur cette connexion —
c'est voulu, et c'est l'objet du module 03.

Vérifie dans un terminal — Windows : **Git Bash** (menu Démarrer → « Git Bash »), pas PowerShell :
```
git --version && docker compose version && node --version && jq --version && claude --version
claude doctor      # diagnostic complet de l'installation, sans ouvrir de session
```

## 2. Le repo et l'app
```
git clone https://github.com/harry-agentic-factory/harry-claude-training-sample
cd harry-claude-training-sample
docker compose up --build -d      # 2-3 min la première fois (télécharge les images)
docker compose ps                 # attendu : backend ET frontend « healthy »
```
Ouvre http://localhost:8080 : tu dois voir « Mes tâches ». Puis `docker compose down`.
Un port 8000 ou 8080 déjà pris ? Ce n'est pas grave, on remappe le jour J.

## 3. Le navigateur de test (Playwright) — **l'étape qui peut bloquer**
La formation pilote un vrai navigateur. Au premier usage, Playwright télécharge Chromium (~150 Mo) :
c'est l'étape que les proxys d'entreprise bloquent. On la fait **ce soir**, pas demain à 18 en même
temps. Aucune connexion à Claude n'est nécessaire :
```
npx playwright install chromium
```
Si ça échoue (proxy, certificat, timeout) : **note l'erreur exacte et signale-la avant la session**.
On a un plan B, mais il faut le savoir à l'avance.

Bonus, seulement si tu t'es déjà connecté avec un compte existant : relance l'app
(`docker compose up -d`), lance `claude` et tape dans la conversation
`ouvre http://localhost:8080 avec playwright et dis-moi le titre de la page`. Ça valide la chaîne
complète. Sinon, on le fera ensemble demain.

## 4. Optionnel : l'extension VS Code « Harry AI Tutor »
Si tu utilises VS Code, **une commande** depuis le dossier du repo installe l'extension officielle
**Claude Code** (Anthropic) puis Harry (le `.vsix` est dans le repo) :
```
bash tools/harry-ai-tutor/install.sh                                     # macOS, Linux, Windows (Git Bash)
powershell -ExecutionPolicy Bypass -File tools\harry-ai-tutor\install.ps1   # Windows (PowerShell)
```
Ouvre ensuite le dossier du repo dans VS Code : l'icône Harry apparaît dans la barre de gauche (carte du
parcours, étape courante, bilan). Au premier lancement de Claude Code, connecte-toi avec ton compte.

## 5. Le jour J

**1. Ta clé.** Elle t'est remise à l'accueil. Dans ton terminal (Git Bash sous Windows, zsh sous
macOS), rends-la permanente — sinon elle disparaît dès que tu ouvres un autre terminal, et tu en
ouvriras plusieurs :
```
echo 'export ANTHROPIC_API_KEY=ta-cle-ici' >> ~/.bashrc   # Git Bash / Linux
echo 'export ANTHROPIC_API_KEY=ta-cle-ici' >> ~/.zshrc    # macOS
```
Puis **ouvre un nouveau terminal** et vérifie avec `claude` → `/status`.

La clé est **personnelle et nominative** : elle ne se partage pas, ne se colle jamais dans le repo,
et ne s'affiche jamais dans une commande (le repo a un garde-fou qui t'en empêchera — c'est le
module 06).

**2. La formation.** Dans le dossier du repo : `claude`, puis `/formation`. Le tuteur te demande ton
prénom et ton profil (`dev` / `po` / `techlead`) et te guide un pas à la fois. Le formateur peut dire
« tout le monde tape `/formation 11` » pour synchroniser la salle.

Fiche de référence (accès connecté) :
https://training.harington.fr/formation/fiche_prise_en_main_claude.html
