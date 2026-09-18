# Installe dans VS Code : l'extension officielle Claude Code (si absente) puis Harry AI Tutor (.vsix du dossier).
# Usage (Windows PowerShell) : powershell -ExecutionPolicy Bypass -File tools\harry-ai-tutor\install.ps1
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Resolve-Path (Join-Path $here "..\..")

if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
  Write-Host "✗ La commande 'code' (VS Code) n'est pas dans le PATH."
  Write-Host "  Relance le terminal après l'installation de VS Code, ou réinstalle-le en cochant « Add to PATH »."
  exit 1
}

$vsix = Get-ChildItem -Path $here -Filter "harry-ai-tutor-*.vsix" | Sort-Object Name | Select-Object -Last 1
if (-not $vsix) {
  Write-Host "✗ Aucun fichier harry-ai-tutor-*.vsix dans $here (générer avec : cd tools\harry-ai-tutor ; npm install ; npm run package)."
  exit 1
}

$installed = @(code --list-extensions 2>$null)
if ($installed -match '^(?i)anthropic\.claude-code$') {
  Write-Host "✓ Extension Claude Code déjà installée"
} else {
  Write-Host "… Installation de l'extension Claude Code (Anthropic) depuis le Marketplace"
  code --install-extension anthropic.claude-code
}

Write-Host "… Installation de Harry AI Tutor ($($vsix.Name))"
code --install-extension $vsix.FullName --force

Write-Host ""
Write-Host "✓ Terminé. Ouvre le repo dans VS Code :  code `"$repo`""
Write-Host "  Puis : icône Harry (barre de gauche) → « Démarrer la formation »."
Write-Host "  (Si VS Code est déjà ouvert : Ctrl+Shift+P → « Developer: Reload Window ».)"
