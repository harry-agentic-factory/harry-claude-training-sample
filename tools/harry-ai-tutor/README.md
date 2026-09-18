# Harry AI Tutor — extension VS Code

Compagnon visuel du tuteur `/formation` (Claude Code) du repo **harry-claude-training-sample**.
Le tuteur reste dans Claude Code (le cerveau) ; l'extension est un **viewer + télécommande** :

- **Carte animée** du parcours (profil `dev` / `po` / `techlead`) : modules faits, en cours, sautés, optionnels.
- **Étape courante** : concept, exercice du profil, vérification, « à retenir », lien vers la section de la fiche.
- **Fichiers de l'étape** ouverts en un clic (et automatiquement, en aperçu).
- **Bilan** dans le panneau : anneau de progression, temps écoulé et restant (estimé par profil), modules faits /
  sautés (avec « y aller ») / restants, « à retenir » des modules faits, notes — et un bouton pour demander à
  Harry le bilan personnalisé.
- **Sans extension Claude Code** : une carte explique comment l'installer (bouton « Installer Claude Code »,
  lien Marketplace, étapes de connexion) et disparaît dès qu'elle est présente ; « Démarrer » propose le même choix
  ou de continuer avec le terminal.
- **Réinitialiser** (icône ↺ de l'en-tête, bouton du bilan, ou commande « Harry : réinitialiser la progression ») :
  après confirmation, efface `.formation/progress.json` et revient à l'accueil. Branche Git et conversations intactes.
- **Suivant / Démarrer** : Harry **pré-remplit** la commande (`/formation suivant`…) dans le panneau de
  l'extension Claude Code, sur la conversation du tuteur ; tu valides avec **Entrée**. (Sans l'extension
  Claude Code : repli sur un terminal intégré où Harry lance `claude` et tape les commandes.)

## Installation (stagiaires)

Le `.vsix` est versionné dans ce dossier. Depuis la racine du repo cloné, **une commande** installe
l'extension Claude Code (si absente) puis Harry :

```bash
bash tools/harry-ai-tutor/install.sh                                   # macOS, Linux, Windows (Git Bash)
powershell -ExecutionPolicy Bypass -File tools\harry-ai-tutor\install.ps1   # Windows (PowerShell)
```

Puis ouvrir le dossier du repo dans VS Code : l'icône **Harry** apparaît dans la barre d'activité ;
**Démarrer la formation** ouvre Claude Code avec `/formation` prêt → **Entrée**. Se connecter à Claude Code
au premier lancement (compte Pro, Max, Team ou Enterprise).

À la main si besoin : Extensions (Ctrl+Shift+X) → menu `…` → **Install from VSIX…** → `harry-ai-tutor-<version>.vsix`.

Prérequis : ceux de la formation (`docs/formation-prerequis.md`).

## Réglages

| Réglage | Défaut | Rôle |
|---|---|---|
| `harryTutor.bridge` | `auto` | `auto` (extension Claude Code si installée, sinon terminal) · `claude-extension` · `claude-deeplink` · `terminal` |
| `harryTutor.autoOpenFiles` | `true` | ouvre en aperçu le premier fichier cité par l'étape |
| `harryTutor.claudeCommand` | `claude` | commande lancée dans le terminal (mode terminal uniquement) |

## Comment ça marche

- **Source de vérité** : `.formation/progress.json` (écrit par le tuteur Claude) + les fichiers de la skill
  `.claude/skills/formation-guide/` (parcours, modules). L'extension les **lit et les surveille** ; elle
  ne contient aucune pédagogie.
- **Pont vers Claude Code** (`harryTutor.bridge`) :
  - **extension Claude Code** (recommandé) : pas d'API pour *soumettre* un prompt, mais deux façons de le
    **pré-remplir** — la commande `claude-vscode.editor.open(sessionId, prompt)` (respecte l'emplacement
    préféré : barre latérale ou onglet) et le deep link documenté `vscode://anthropic.claude-code/open?prompt=…&session=…`
    (ouvre un onglet). Harry retrouve la conversation du tuteur (session la plus récente du projet, dans
    `~/.claude/projects/<projet>/`, dont la transcription commence par la commande `/formation`) et y
    pré-remplit la commande ; un toast rappelle « appuie sur Entrée ».
  - **terminal** (repli) : un terminal « Harry · Claude Code » ; `claude` est lancé via l'intégration shell
    de VS Code, puis les commandes sont tapées dans Claude Code.
- **Journal** : canal de sortie « Harry AI Tutor » + fichier `.formation/harry.log` (git-ignoré).

## Développer

```bash
cd tools/harry-ai-tutor
npm install
npm run build           # dist/ (extension + webview)
npm run package         # → harry-ai-tutor-<version>.vsix
npm run test:harness    # page de test du panneau dans un navigateur : http://localhost:8765/test/harness.html
node test/vscode/runTest.mjs   # test dans un VS Code réel (extension host), via @vscode/test-electron
```
Debug : ouvrir ce dossier dans VS Code, `F5` (Extension Development Host), puis ouvrir le repo de formation.

## Limites connues

- **Entrée à valider** : l'extension Claude Code n'expose aucune API de soumission ; Harry pré-remplit, le
  stagiaire valide (« pre-filled but not submitted automatically », doc officielle).
- **Slash commands dans l'extension** : la doc indique un *sous-ensemble* des commandes CLI ; vérifier que
  `/formation` apparaît en tapant `/` dans le panneau. Sinon, régler `harryTutor.bridge` sur `terminal`.
- Avant le premier `/formation` envoyé, **Suivant** demande de commencer par **Démarrer** (aucune conversation
  tuteur à retrouver).

La lecture vocale (Kokoro + espeak-ng, hors-ligne) a été retirée le 2026-09-17 ; sources archivées dans
`_toDelete/2026-09-17__voice-kokoro/`.
