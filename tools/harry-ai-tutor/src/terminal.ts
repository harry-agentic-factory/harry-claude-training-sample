import * as vscode from "vscode";
import type { Bridge, SendResult } from "./claudeBridge";
import { log } from "./log";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const TERM_NAME = "Harry · Claude Code";

/**
 * Pont vers le terminal intégré : lance `claude` et lui tape des commandes (/formation …).
 * Utilise l'intégration shell de VS Code quand elle est disponible pour savoir si `claude` tourne.
 */
export class TerminalBridge implements Bridge, vscode.Disposable {
  readonly kind = "terminal" as const;
  private term: vscode.Terminal | undefined;
  private running = false; // `claude` est-il en cours d'exécution dans le terminal ?
  private execution: vscode.TerminalShellExecution | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(private readonly cwd: string, private readonly command: () => string) {
    this.disposables.push(
      vscode.window.onDidCloseTerminal((t) => { if (t === this.term) { this.term = undefined; this.running = false; } }),
      vscode.window.onDidEndTerminalShellExecution((e) => {
        if (e.terminal === this.term && (!this.execution || e.execution === this.execution)) {
          this.running = false; this.execution = undefined;
          log("claude s'est terminé (exit " + e.exitCode + ")");
        }
      }),
    );
    // Réutilise un terminal Harry existant (session VS Code restaurée).
    this.term = vscode.window.terminals.find((t) => t.name === TERM_NAME);
  }

  get isRunning() { return this.running; }

  private ensure(): vscode.Terminal {
    if (!this.term || this.term.exitStatus) {
      this.term = vscode.window.createTerminal({ name: TERM_NAME, cwd: this.cwd, iconPath: new vscode.ThemeIcon("mortar-board") });
      this.running = false;
    }
    return this.term;
  }

  private async waitShellIntegration(t: vscode.Terminal, ms: number) {
    if (t.shellIntegration) return t.shellIntegration;
    return new Promise<vscode.TerminalShellIntegration | undefined>((resolve) => {
      const timer = setTimeout(() => { sub.dispose(); resolve(undefined); }, ms);
      const sub = vscode.window.onDidChangeTerminalShellIntegration((e) => {
        if (e.terminal === t) { clearTimeout(timer); sub.dispose(); resolve(e.shellIntegration); }
      });
    });
  }

  /** Lance `claude` (si besoin) puis tape `/formation`. */
  async start(): Promise<SendResult> {
    const t = this.ensure();
    t.show(true);
    if (!this.running) {
      const si = await this.waitShellIntegration(t, 3000);
      const cmd = this.command();
      if (si) { this.execution = si.executeCommand(cmd); log("lancement via shell integration : " + cmd); }
      else { t.sendText(cmd, true); log("lancement via sendText : " + cmd); }
      this.running = true;
      await sleep(5000); // laisser Claude Code démarrer
    }
    await this.type("/formation");
    return { via: "terminal", prefilled: false };
  }

  /** Tape une commande dans Claude Code (le lance d'abord si nécessaire). */
  async send(text: string): Promise<SendResult> {
    if (!this.running) {
      await this.start();
      if (text.trim() !== "/formation") { await sleep(1500); await this.type(text); }
      return { via: "terminal", prefilled: false };
    }
    this.ensure().show(true);
    await this.type(text);
    return { via: "terminal", prefilled: false };
  }

  private async type(text: string) {
    const t = this.ensure();
    t.sendText(text + " ", false); // espace final : ferme le menu d'autocomplétion des slash commands
    await sleep(350);
    t.sendText("\r", false);       // Entrée explicite (pas de \r\n Windows)
    log("→ " + text);
  }

  dispose() { for (const d of this.disposables) d.dispose(); }
}
