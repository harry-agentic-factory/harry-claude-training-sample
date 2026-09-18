import * as vscode from "vscode";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { log } from "./log";

export const CLAUDE_EXT_ID = "anthropic.claude-code";

export type SendResult = { via: "claude-command" | "claude-deeplink" | "terminal"; prefilled: boolean; session?: string };
export interface Bridge {
  readonly kind: "claude" | "terminal";
  start(): Promise<SendResult>;
  send(text: string): Promise<SendResult>;
}

/**
 * Pont vers l'extension officielle Claude Code (panneau de chat).
 * Il n'existe pas d'API pour SOUMETTRE un prompt : on le **pré-remplit** dans la zone de saisie
 * (commande interne `claude-vscode.editor.open(sessionId, initialPrompt)`, ou deep link documenté
 * `vscode://anthropic.claude-code/open?prompt=…&session=…`). Le stagiaire appuie sur Entrée.
 */
export class ClaudeExtensionBridge implements Bridge {
  readonly kind = "claude" as const;
  constructor(private readonly root: string, private readonly mode: () => "auto" | "command" | "deeplink") {}

  static available(): boolean { return !!vscode.extensions.getExtension(CLAUDE_EXT_ID); }

  private async activate() {
    const e = vscode.extensions.getExtension(CLAUDE_EXT_ID);
    if (e && !e.isActive) await e.activate();
  }

  /** Dossier des sessions CLI de ce projet : ~/.claude/projects/<chemin encodé>/ */
  private projectDir(): string {
    return path.join(os.homedir(), ".claude", "projects", this.root.replace(/[^A-Za-z0-9]/g, "-"));
  }

  /** Session la plus récente de ce projet où la commande /formation a été lancée (le fil du tuteur). */
  findTutorSession(): string | undefined {
    const dir = this.projectDir();
    let files: string[] = [];
    try { files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsonl")); } catch { return undefined; }
    const recent = files
      .map((f) => ({ id: f.slice(0, -6), t: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t)
      .slice(0, 10);
    for (const { id } of recent) {
      try {
        const fd = fs.openSync(path.join(dir, id + ".jsonl"), "r");
        const buf = Buffer.alloc(64 * 1024); // le fil du tuteur commence par /formation : les premiers Ko suffisent
        const n = fs.readSync(fd, buf, 0, buf.length, 0);
        fs.closeSync(fd);
        // Une invocation de slash command est journalisée sous la forme <command-name>/formation</command-name> :
        // précis (une session qui parle DE /formation sans l'avoir lancée n'est pas retenue).
        if (buf.toString("utf8", 0, n).includes("<command-name>/formation")) return id;
      } catch { /* fichier en cours d'écriture */ }
    }
    return undefined;
  }

  async start(): Promise<SendResult> {
    // Nouvelle conversation, prompt pré-rempli : le deep link documenté crée un onglet neuf.
    await this.activate();
    if (this.mode() !== "deeplink") {
      try {
        // Un seul appel : nouvelle conversation (sessionId absent) avec le prompt pré-rempli.
        await vscode.commands.executeCommand("claude-vscode.editor.open", undefined, "/formation");
        log("start via claude-vscode.editor.open");
        return { via: "claude-command", prefilled: true };
      } catch (e) { log("start : commande interne KO, repli deep link : " + String(e)); }
    }
    await this.deeplink("/formation");
    return { via: "claude-deeplink", prefilled: true };
  }

  async send(text: string): Promise<SendResult> {
    await this.activate();
    const session = this.findTutorSession();
    if (!session) {
      // Pas encore de fil tuteur : on ne crée pas un 2e onglet, on focalise Claude et on prévient.
      try { await vscode.commands.executeCommand("claude-vscode.focus"); } catch { /* ignore */ }
      throw new Error("Pas encore de conversation /formation : lance d'abord « Démarrer », envoie /formation dans Claude Code (Entrée), puis réessaie.");
    }
    if (this.mode() !== "deeplink") {
      try {
        await vscode.commands.executeCommand("claude-vscode.editor.open", session, text);
        log(`send via editor.open → session ${session} : ${text}`);
        return { via: "claude-command", prefilled: true, session };
      } catch (e) { log("send : commande interne KO, repli deep link : " + String(e)); }
    }
    await this.deeplink(text, session);
    return { via: "claude-deeplink", prefilled: true, session };
  }

  private async deeplink(prompt: string, session?: string) {
    const q = "prompt=" + encodeURIComponent(prompt) + (session ? "&session=" + encodeURIComponent(session) : "");
    const uri = vscode.Uri.parse(`vscode://${CLAUDE_EXT_ID}/open?${q}`);
    log("deep link → " + uri.toString());
    await vscode.env.openExternal(uri);
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
