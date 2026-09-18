import * as vscode from "vscode";
import * as path from "node:path";
import { ProgressStore } from "./progress";
import { TerminalBridge } from "./terminal";
import { ClaudeExtensionBridge, type Bridge } from "./claudeBridge";
import { TutorViewProvider } from "./sidebarProvider";
import { FICHE_URL } from "./types";
import { initLog, log } from "./log";

export async function activate(ctx: vscode.ExtensionContext) {
  const root = await findRoot();
  if (!root) return;
  const store = new ProgressStore(root);
  const out = vscode.window.createOutputChannel("Harry AI Tutor");
  initLog(root, out);
  log(`activation — repo ${root} — Claude Code ext ${ClaudeExtensionBridge.available() ? "présente" : "absente"}`);
  const cfg = () => vscode.workspace.getConfiguration("harryTutor");
  const terminal = new TerminalBridge(root, () => cfg().get<string>("claudeCommand", "claude"));
  const claude = new ClaudeExtensionBridge(root, () => {
    const m = cfg().get<string>("bridge", "auto");
    return m === "claude-deeplink" ? "deeplink" : m === "claude-extension" ? "command" : "auto";
  });
  // Pont actif : extension Claude Code si installée (sauf réglage "terminal"), sinon terminal intégré.
  const pick = (): Bridge => {
    const m = cfg().get<string>("bridge", "auto");
    if (m === "terminal") return terminal;
    if (m === "auto" && !ClaudeExtensionBridge.available()) return terminal;
    return claude;
  };
  const bridge: Bridge = { get kind() { return pick().kind; }, start: () => pick().start(), send: (t) => pick().send(t) };
  const provider = new TutorViewProvider(ctx, store, bridge);
  ctx.subscriptions.push(
    store, terminal, out,
    vscode.window.registerWebviewViewProvider("harryTutor.view", provider, { webviewOptions: { retainContextWhenHidden: true } }),
    vscode.commands.registerCommand("harryTutor.start", () => bridge.start()),
    vscode.commands.registerCommand("harryTutor.next", () => bridge.send("/formation suivant")),
    vscode.commands.registerCommand("harryTutor.bilan", () => bridge.send("/formation bilan")),
    vscode.commands.registerCommand("harryTutor.openFiche", () => vscode.env.openExternal(vscode.Uri.parse(FICHE_URL))),
    vscode.commands.registerCommand("harryTutor.reset", () => provider.reset()),
  );
  // API de test (Extension Development Host / @vscode/test-electron).
  return { getState: () => store.state, bridgeKind: () => bridge.kind, claudeInstalled: () => ClaudeExtensionBridge.available(), viewResolved: () => provider.isResolved, findTutorSession: () => claude.findTutorSession() };
}

export function deactivate(): void {}

/** Racine du repo de formation : le dossier qui contient .claude/skills/formation-guide/SKILL.md. */
async function findRoot(): Promise<string | undefined> {
  const found = await vscode.workspace.findFiles("**/.claude/skills/formation-guide/SKILL.md", "**/node_modules/**", 1);
  if (found.length) return path.resolve(path.dirname(found[0].fsPath), "..", "..", "..");
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
