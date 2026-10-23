// Panneau « Suivi » : la page tools/suivi (parcours en serpent) affichée dans un onglet VS Code,
// régénérée à chaque changement de .formation/progress.json.
import * as vscode from "vscode";
import { buildHtml } from "../../suivi/lib.mjs";
import type { ProgressStore } from "./progress";
import { log } from "./log";

export class SuiviPanel implements vscode.Disposable {
  private panel: vscode.WebviewPanel | undefined;
  private readonly sub: vscode.Disposable;

  constructor(private readonly store: ProgressStore) {
    this.sub = store.onDidChange(() => this.render());
  }

  /** Ouvre (ou ramène au premier plan) l'onglet Suivi. */
  show(): void {
    if (this.panel) { this.panel.reveal(vscode.ViewColumn.Beside, true); this.render(); return; }
    this.panel = vscode.window.createWebviewPanel("harryTutor.suivi", "Suivi de formation", { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, { enableScripts: true });
    this.panel.onDidDispose(() => { this.panel = undefined; });
    this.render();
  }

  private render(): void {
    if (!this.panel) return;
    try {
      this.panel.webview.html = buildHtml(this.store.root);
    } catch (e) {
      const msg = String((e as Error)?.message ?? e);
      log("suivi : " + msg);
      this.panel.webview.html = `<body style="font-family:sans-serif;padding:16px"><h3>Suivi indisponible</h3><p>${msg.replace(/[&<>]/g, "")}</p><p>Vérifie que <code>tools/suivi/template.html</code> existe dans le repo.</p></body>`;
    }
  }

  dispose(): void { this.sub.dispose(); this.panel?.dispose(); }
}
