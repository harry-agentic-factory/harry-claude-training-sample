import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs";
import type { HostMessage, TutorState, WebviewMessage } from "./types";
import type { ProgressStore } from "./progress";
import { CLAUDE_EXT_ID, ClaudeExtensionBridge, type Bridge, type SendResult } from "./claudeBridge";
import { log } from "./log";

export class TutorViewProvider implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;
  private lastEtape: string | undefined;
  private resolved = false;
  get isResolved() { return this.resolved; }

  constructor(private readonly ctx: vscode.ExtensionContext, private readonly store: ProgressStore, private readonly bridge: Bridge) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view; this.resolved = true; log("webview résolue");
    view.webview.options = { enableScripts: true, localResourceRoots: [this.ctx.extensionUri] };
    view.webview.html = this.html(view.webview);
    const subs = [
      view.webview.onDidReceiveMessage((m: WebviewMessage) => void this.onMessage(m)),
      this.store.onDidChange((s) => { this.post({ type: "state", state: s }); this.maybeAutoOpen(s); }),
      vscode.workspace.onDidChangeConfiguration((e) => { if (e.affectsConfiguration("harryTutor")) this.postConfig(); }),
      vscode.extensions.onDidChange(() => this.postConfig()), // installation de Claude Code → la carte d'aide disparaît
    ];
    view.onDidDispose(() => { for (const s of subs) s.dispose(); this.view = undefined; });
  }

  private post(m: HostMessage) { void this.view?.webview.postMessage(m); }

  private async onMessage(m: WebviewMessage) {
    switch (m.type) {
      case "ready":
        this.postConfig();
        this.post({ type: "state", state: this.store.state });
        this.lastEtape = this.store.state.progress?.etape;
        break;
      case "cmd":
        if (m.cmd === "reset") { await this.reset(); break; }
        if ((m.cmd === "start" || m.cmd === "next" || m.cmd === "bilan" || m.cmd === "goto") && !(await this.claudeOrTerminalOk())) break;
        try {
          let r: SendResult | undefined; let text = "";
          if (m.cmd === "start") { text = "/formation"; r = await this.bridge.start(); }
          else if (m.cmd === "next") { text = "/formation suivant"; r = await this.bridge.send(text); }
          else if (m.cmd === "bilan") { text = "/formation bilan"; r = await this.bridge.send(text); }
          else if (m.cmd === "check") { text = "/formation check"; r = await this.bridge.send(text); }
          else if (m.cmd === "goto" && m.arg) { text = "/formation " + m.arg.replace(/^0/, ""); r = await this.bridge.send(text); }
          if (r) { log(`envoyé « ${text} » via ${r.via}${r.session ? " → session " + r.session : ""}`); this.notifySent(text, r); }
        } catch (e) {
          const msg = String((e as Error)?.message ?? e);
          log("erreur : " + msg);
          this.post({ type: "toast", kind: "warn", text: msg });
          void vscode.window.showWarningMessage("Harry : " + msg);
        }
        break;
      case "open": await this.open(m.rel); break;
      case "installClaude": await this.installClaude(); break;
      case "showClaude": await vscode.commands.executeCommand("workbench.extensions.search", "@id:" + CLAUDE_EXT_ID); break;
      case "openExternal": await vscode.env.openExternal(vscode.Uri.parse(m.url)); break;
      case "log": log(`[webview ${m.level}] ${m.text}`); break;
    }
  }

  private postConfig() { this.post({ type: "config", bridge: this.bridge.kind, claudeExt: ClaudeExtensionBridge.available() }); }

  /** Lance l'installation de l'extension officielle Claude Code depuis le Marketplace. */
  async installClaude(): Promise<void> {
    try {
      log("installation de l'extension Claude Code demandée");
      this.post({ type: "toast", kind: "ok", text: "Installation de Claude Code lancée… (voir la notification VS Code)" });
      await vscode.commands.executeCommand("workbench.extensions.installExtension", CLAUDE_EXT_ID);
      this.postConfig();
      void vscode.window.showInformationMessage("Claude Code est installé. Ouvre-le (icône Claude dans la barre) et connecte-toi, puis reviens dans Harry.");
    } catch (e) {
      log("installation Claude Code KO : " + String((e as Error)?.message ?? e));
      this.post({ type: "toast", kind: "warn", text: "Installation automatique impossible : ouvre le Marketplace (bouton ci-dessous) et installe « Claude Code » (Anthropic)." });
      await vscode.commands.executeCommand("workbench.extensions.search", "@id:" + CLAUDE_EXT_ID);
    }
  }

  /** Sans extension Claude Code (mode auto) : propose d'installer, ou de continuer avec le terminal. */
  private async claudeOrTerminalOk(): Promise<boolean> {
    if (ClaudeExtensionBridge.available()) return true;
    if (vscode.workspace.getConfiguration("harryTutor").get<string>("bridge", "auto") !== "auto") return true; // choix explicite
    const choice = await vscode.window.showInformationMessage(
      "L'extension Claude Code (Anthropic) n'est pas installée. Harry lui envoie normalement les commandes /formation.",
      "Installer Claude Code", "Continuer avec le terminal",
    );
    if (choice === "Installer Claude Code") { await this.installClaude(); return false; }
    return choice === "Continuer avec le terminal";
  }

  /** Remet la formation à zéro : supprime .formation/progress.json (après confirmation). */
  async reset(): Promise<void> {
    const file = path.join(this.store.root, ".formation", "progress.json");
    const exists = fs.existsSync(file);
    const choice = await vscode.window.showWarningMessage(
      "Réinitialiser la formation ?",
      { modal: true, detail: (exists ? "La progression (profil, étape, modules faits, notes) sera effacée : Harry repart à l'accueil.\n\n" : "Aucune progression enregistrée.\n\n") + "La branche Git et les conversations Claude Code ne sont pas touchées." },
      "Réinitialiser",
    );
    if (choice !== "Réinitialiser") return;
    try { if (exists) fs.rmSync(file); } catch (e) { void vscode.window.showErrorMessage("Harry : impossible de supprimer progress.json — " + String((e as Error)?.message ?? e)); return; }
    this.lastEtape = undefined;
    log("progression réinitialisée (progress.json supprimé)");
    this.store.refresh();
    this.post({ type: "toast", kind: "ok", text: "Progression remise à zéro. Clique « Démarrer la formation » pour repartir." });
    vscode.window.setStatusBarMessage("Harry : progression réinitialisée", 5000);
  }

  private notifySent(text: string, r: SendResult) {
    const msg = r.prefilled
      ? `« ${text} » est prêt dans Claude Code : appuie sur Entrée.`
      : `« ${text} » envoyé au terminal Claude Code.`;
    this.post({ type: "toast", kind: "ok", text: msg });
    vscode.window.setStatusBarMessage("Harry : " + msg, 7000);
  }

  private maybeAutoOpen(s: TutorState) {
    const et = s.progress?.etape;
    if (!et || et === this.lastEtape) return;
    this.lastEtape = et;
    if (vscode.workspace.getConfiguration("harryTutor").get("autoOpenFiles", true) && s.files[0]) void this.open(s.files[0].rel);
  }

  private async open(rel: string) {
    const uri = vscode.Uri.file(path.join(this.store.root, rel));
    try { await vscode.window.showTextDocument(uri, { preview: true, preserveFocus: true, viewColumn: vscode.ViewColumn.One }); }
    catch (e) { void vscode.window.showWarningMessage("Harry : impossible d'ouvrir " + rel); }
  }

  private html(webview: vscode.Webview): string {
    const u = (...p: string[]) => webview.asWebviewUri(vscode.Uri.joinPath(this.ctx.extensionUri, ...p)).toString();
    const nonce = [...Array(24)].map(() => Math.random().toString(36)[2]).join("");
    const csp = webview.cspSource;
    const boot = { dist: u("dist"), media: u("media"), lang: "fr" };
    return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${csp} data:; style-src ${csp} 'unsafe-inline'; font-src ${csp} data:; script-src 'nonce-${nonce}' ${csp};">
<link rel="stylesheet" href="${u("media", "webview.css")}">
<title>Harry AI Tutor</title></head>
<body><div id="app" class="app"><div class="boot">Harry se réveille…</div></div>
<script nonce="${nonce}">window.__HARRY__ = ${JSON.stringify(boot)};</script>
<script type="module" nonce="${nonce}" src="${u("dist", "main.js")}"></script>
</body></html>`;
  }
}
